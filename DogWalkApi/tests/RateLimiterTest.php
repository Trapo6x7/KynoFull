<?php

namespace App\Tests;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class RateLimiterTest extends WebTestCase
{
    public function testRateLimiterBlocksAfterLimit(): void
    {
       /** @var KernelBrowser $client */
    $client = static::createClient();


    $data = [
        'email' => 'stringgggg@tred.com',
        'password' => 'string',
        'name' => 'string',
        'birthdate' => '2000-04-08T09:53:45.385Z'
    ];


    $jsonData = json_encode($data);


    for ($i = 0; $i < 5; $i++) {
        $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/ld+json'], $jsonData);
        $this->assertNotEquals(429, $client->getResponse()->getStatusCode(), "Request $i failed prematurely");
    }


    $client->request('POST', '/api/register', [], [], ['CONTENT_TYPE' => 'application/ld+json'], $jsonData);
    $this->assertEquals(429, $client->getResponse()->getStatusCode(), "Rate limiter did not block the 6th request");
    }
}
