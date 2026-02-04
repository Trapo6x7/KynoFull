// Import de la fonction handleAcceptRequest, qui fait un PATCH puis un POST
import { handleAcceptRequest } from '../groupHandlers';


// Avant tous les tests, on définit la variable d'environnement pour l'URL de l'API
beforeAll(() => {
  process.env.VITE_API_URL = 'http://localhost';
});

// Simulation globale de fetch pour intercepter les appels HTTP
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Regroupement des tests pour handleAcceptRequest
describe('handleAcceptRequest', () => {
  const group = {
    id: 1,
    name: 'Test Group',
    comment: 'desc',
    mixed: true,
    createdAt: new Date().toISOString(),
    walks: [],
    groupRequests: [
      { id: 42, user: { id: 7, name: 'Alice' }, status: false }
    ],
    groupRoles: []
  };
  const setLocalGroupRequests = jest.fn();
  const setLocalGroupRoles = jest.fn();

  // Avant chaque test, on réinitialise les mocks et on stocke un token
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('authToken', 'token');
  });

  it('effectue PATCH puis POST lors de l’acceptation d’une demande', async () => {
    // 1) Configuration du mock pour le PATCH de la demande (status true)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ walkGroup: '/api/groups/1' })
    });
    // 2) Configuration du mock pour le POST de la création du groupRole MEMBER
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 99 })
    });

    // Appel de la fonction: elle doit effectuer le PATCH puis le POST
    await handleAcceptRequest(
      group.groupRequests[0],
      setLocalGroupRequests,
      setLocalGroupRoles
    );


    // Vérification: on doit avoir deux appels à fetch, un pour PATCH, un pour POST
    expect(mockFetch).toHaveBeenCalledTimes(2);
    // Premier appel: URL de patch sur group_requests/42
    expect(mockFetch.mock.calls[0][0]).toMatch(/group_requests\/42/);
    expect(mockFetch.mock.calls[0][1].method).toBe('PATCH');
    // Deuxième appel: URL de post sur group_roles
    expect(mockFetch.mock.calls[1][0]).toMatch(/group_roles/);
    expect(mockFetch.mock.calls[1][1].method).toBe('POST');
  });
});
