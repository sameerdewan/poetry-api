const request = require('supertest');
const app = require('../../app');

describe('Poetry API', () => {
    test('Upload file and receive hash from API', async () => {
        const filePath = `${__dirname}/test.pdf`;
        await request(app)
            .post('/api/poetry')
            .attach('file', filePath)
            .then(response => {
                const expectedHash = '1cc47a02d842fbbfe3fe3b51489b8fe5c424765996d47c12652f7fed2f318ed5';
                expect(response.body.hash).toEqual(expectedHash);
            });
    });
});

