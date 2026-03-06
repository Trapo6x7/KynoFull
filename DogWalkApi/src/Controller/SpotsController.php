<?php

namespace App\Controller;

use App\Entity\Walk;
use App\Repository\WalkRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class SpotsController extends AbstractController
{
    private const CACHE_TTL   = 1800; // 30 min
    private const RADIUS_M    = 2000;
    private const MAX_RESULTS = 30;

    private const OVERPASS_ENDPOINTS = [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
        'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
    ];

    public function __construct(
        private readonly CacheInterface         $cache,
        private readonly HttpClientInterface    $http,
        private readonly EntityManagerInterface $em,
        private readonly WalkRepository         $walkRepository,
    ) {}

    #[Route('/api/spots', name: 'spots_near', methods: ['GET'])]
    public function near(Request $request): JsonResponse
    {
        $lat = $request->query->get('lat');
        $lon = $request->query->get('lon');

        if ($lat === null || $lon === null) {
            throw new BadRequestHttpException('lat et lon sont requis.');
        }

        $lat = round((float) $lat, 2);
        $lon = round((float) $lon, 2);

        $cacheKey = 'spots_' . str_replace(['.', '-'], ['d', 'm'], "{$lat}_{$lon}");

        $spots = $this->cache->get($cacheKey, function (ItemInterface $item) use ($lat, $lon): array {
            $item->expiresAfter(self::CACHE_TTL);
            return $this->fetchFromOverpass($lat, $lon);
        });

        return $this->json($spots);
    }

    // ── User spot ratings ─────────────────────────────────────────────────────

    /** Returns all OSM spot ratings saved by the authenticated user. */
    #[Route('/api/spots/ratings', name: 'spots_my_ratings', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function myRatings(): JsonResponse
    {
        $user  = $this->getUser();
        $walks = $this->walkRepository->findBy(['user' => $user]);

        $map = [];
        foreach ($walks as $walk) {
            if ($walk->getOsmId() !== null && $walk->getRating() !== null) {
                $map[(string) $walk->getOsmId()] = $walk->getRating();
            }
        }

        return $this->json($map);
    }

    /** Creates or updates the authenticated user's rating for an OSM spot. */
    #[Route('/api/spots/rate', name: 'spots_rate', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function rate(Request $request): JsonResponse
    {
        $body   = json_decode((string) $request->getContent(), true) ?? [];
        $osmId  = isset($body['osmId'])  ? (int) $body['osmId']  : null;
        $rating = isset($body['rating']) ? (int) $body['rating'] : null;

        if ($osmId === null || $rating === null) {
            throw new BadRequestHttpException('osmId et rating sont requis.');
        }
        if ($rating < 1 || $rating > 5) {
            throw new BadRequestHttpException('rating doit être entre 1 et 5.');
        }

        $user = $this->getUser();

        // Reuse existing Walk record for this user+osmId if it exists.
        $walk = $this->walkRepository->findOneBy(['user' => $user, 'osmId' => $osmId]);

        if ($walk === null) {
            $walk = new Walk();
            /** @var \App\Entity\User $user */
            $walk->setUser($user);
            $walk->setOsmId($osmId);
            $walk->setName('spot');
            $walk->setLocation('');
            $this->em->persist($walk);
        }

        $walk->setRating($rating);
        $this->em->flush();

        return $this->json(['osmId' => $osmId, 'rating' => $rating]);
    }

    /**
     * Returns the community average rating for a list of OSM spot IDs.
     * Public endpoint — no authentication required.
     * Query: GET /api/spots/avg-ratings?osmIds=111,222,333
     */
    #[Route('/api/spots/avg-ratings', name: 'spots_avg_ratings', methods: ['GET'])]
    public function avgRatings(Request $request): JsonResponse
    {
        $raw    = $request->query->get('osmIds', '');
        $osmIds = array_filter(
            array_map('intval', explode(',', (string) $raw)),
            fn (int $id): bool => $id > 0,
        );

        if (empty($osmIds)) {
            return $this->json((object) []);
        }

        $map = $this->walkRepository->findAvgRatingsByOsmIds(array_values($osmIds));

        // Return as string keys for JS JSON compatibility
        $result = [];
        foreach ($map as $id => $avg) {
            $result[(string) $id] = $avg;
        }

        return $this->json($result);
    }

    // ── Overpass ──────────────────────────────────────────────────────────────

    private function fetchFromOverpass(float $lat, float $lon): array
    {
        $r = self::RADIUS_M;
        $query = <<<QUERY
[out:json][timeout:30];
(
  way["leisure"~"park|garden|nature_reserve|dog_park"](around:{$r},{$lat},{$lon});
  way["landuse"~"forest|grass"](around:{$r},{$lat},{$lon});
  way["natural"~"wood|water"](around:{$r},{$lat},{$lon});
);
out center qt 30;
QUERY;

        $lastError = null;
        foreach (self::OVERPASS_ENDPOINTS as $endpoint) {
            try {
                $response = $this->http->request('POST', $endpoint, [
                    'headers' => ['Content-Type' => 'application/x-www-form-urlencoded'],
                    'body'    => 'data=' . urlencode($query),
                    'timeout' => 35,
                ]);

                $data = $response->toArray();
                return $this->parseElements($data['elements'] ?? [], $lat, $lon);
            } catch (\Throwable $e) {
                $lastError = $e;
            }
        }

        throw $lastError ?? new \RuntimeException('Tous les endpoints Overpass ont échoué.');
    }

    private function parseElements(array $elements, float $userLat, float $userLon): array
    {
        $nameBlacklist = [
            'fontaine', 'fountain', "jet d'eau", 'piscine', 'lavoir',
            "bouche d'égout", 'bac à sable', 'aire de jeux', 'place', 'espace',
        ];
        $tagBlacklist = [
            ['waterway', 'ditch'],   ['waterway', 'drain'],  ['waterway', 'stream'],
            ['man_made', 'reservoir_covered'], ['landuse', 'reservoir'],
            ['leisure', 'swimming_pool'],      ['leisure', 'playground'],
        ];

        $seen  = [];
        $spots = [];

        foreach ($elements as $el) {
            $elLat = $el['lat'] ?? $el['center']['lat'] ?? null;
            $elLon = $el['lon'] ?? $el['center']['lon'] ?? null;
            if ($elLat === null || $elLon === null) continue;

            $rawName = $el['tags']['name']
                ?? $el['tags']['name:fr']
                ?? $el['tags']['official_name']
                ?? '';
            if ($rawName === '') continue;

            $nameLower = mb_strtolower(trim($rawName));
            if (in_array($nameLower, $seen, true)) continue;

            $skip = false;
            foreach ($nameBlacklist as $b) {
                if (str_contains($nameLower, $b)) { $skip = true; break; }
            }
            if ($skip) continue;

            foreach ($tagBlacklist as [$key, $value]) {
                if (($el['tags'][$key] ?? null) === $value) { $skip = true; break; }
            }
            if ($skip) continue;

            $seen[] = $nameLower;

            $category = $this->resolveCategory($el['tags'] ?? []);
            $distM    = $this->haversine($userLat, $userLon, (float) $elLat, (float) $elLon);
            $city     = $el['tags']['addr:city']
                ?? $el['tags']['addr:suburb']
                ?? $el['tags']['addr:district']
                ?? 'À proximité';

            $spots[] = [
                'id'          => $el['id'],
                'name'        => $rawName,
                'address'     => $city,
                'distance'    => $this->formatDistance($distM),
                'distanceRaw' => $distM,
                'category'    => $category,
                'latitude'    => (float) $elLat,
                'longitude'   => (float) $elLon,
                'photoUrl'    => $el['tags']['image'] ?? null,
                'rating'      => null,
            ];
        }

        usort($spots, fn ($a, $b) => $a['distanceRaw'] <=> $b['distanceRaw']);

        return array_slice($spots, 0, self::MAX_RESULTS);
    }

    private function resolveCategory(array $tags): string
    {
        if (($tags['leisure'] ?? '') === 'dog_park') return "Aires dogs";
        if (in_array($tags['leisure'] ?? '', ['nature_reserve'], true)
            || in_array($tags['landuse'] ?? '', ['forest'], true)
            || in_array($tags['natural'] ?? '', ['wood'], true)) return 'Forêts';
        if (in_array($tags['natural'] ?? '', ['water'], true)
            || in_array($tags['waterway'] ?? '', ['river', 'canal'], true)) return "Bords d'eau";
        return 'Parcs';
    }

    private function haversine(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $R    = 6_371_000;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a    = sin($dLat / 2) ** 2
              + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;
        return $R * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    private function formatDistance(float $m): string
    {
        return $m < 1000 ? round($m) . ' m' : number_format($m / 1000, 1) . ' km';
    }
}
