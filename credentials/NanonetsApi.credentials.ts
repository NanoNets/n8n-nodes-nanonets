import {
    IAuthenticateGeneric,
    ICredentialTestRequest,
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class NanonetsApi implements ICredentialType {
    name = 'nanonetsApi';
    displayName = 'Nanonets API';
    documentationUrl = 'https://docstrange.nanonets.com/docs';
    properties: INodeProperties[] = [
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            typeOptions: {
                password: true,
            },
            default: '',
            description: 'Your Nanonets API key. Get one at https://app.nanonets.com/',
        },
    ];

    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
            headers: {
                Authorization: '=Bearer {{$credentials.apiKey}}',
            },
        },
    };

    test: ICredentialTestRequest = {
        request: {
            baseURL: 'https://extraction-api.nanonets.com',
            url: '/api/v1/extract/results?page=1&page_size=1',
            method: 'GET',
        },
    };
}
