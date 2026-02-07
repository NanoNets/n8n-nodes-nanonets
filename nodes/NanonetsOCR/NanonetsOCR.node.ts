import {
    IExecuteFunctions,
    IDataObject,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeOperationError,
} from 'n8n-workflow';

export class NanonetsOCR implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Nanonets OCR',
        name: 'nanonetsOcr',
        icon: 'file:nanonets.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Extract and classify documents using Nanonets AI',
        defaults: {
            name: 'Nanonets',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'nanonetsApi',
                required: true,
            },
        ],
        properties: [
            // Resource
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'Document',
                        value: 'document',
                    },
                    {
                        name: 'Classification',
                        value: 'classification',
                    },
                    {
                        name: 'Chat',
                        value: 'chat',
                    },
                ],
                default: 'document',
                required: true,
                description: 'The resource to operate on',
            },

            // ==================== DOCUMENT OPERATIONS ====================
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['document'],
                    },
                },
                options: [
                    {
                        name: 'Extract (Sync)',
                        value: 'extractSync',
                        description: 'Extract data from a document synchronously',
                        action: 'Extract data from document synchronously',
                    },
                    {
                        name: 'Extract (Async)',
                        value: 'extractAsync',
                        description: 'Queue a document for asynchronous extraction',
                        action: 'Queue document for async extraction',
                    },
                    {
                        name: 'Extract (Batch)',
                        value: 'extractBatch',
                        description: 'Process all input items as a batch (max 50)',
                        action: 'Extract from multiple documents',
                    },
                    {
                        name: 'Get Result',
                        value: 'getResult',
                        description: 'Get extraction result by record ID',
                        action: 'Get extraction result',
                    },
                    {
                        name: 'List Results',
                        value: 'listResults',
                        description: 'List recent extraction results',
                        action: 'List extraction results',
                    },
                ],
                default: 'extractSync',
            },

            // ==================== CLASSIFICATION OPERATIONS ====================
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['classification'],
                    },
                },
                options: [
                    {
                        name: 'Classify (Sync)',
                        value: 'classifySync',
                        description: 'Classify a document into categories synchronously',
                        action: 'Classify document synchronously',
                    },
                    {
                        name: 'Classify (Batch)',
                        value: 'classifyBatch',
                        description: 'Classify multiple documents (max 50)',
                        action: 'Classify multiple documents',
                    },
                ],
                default: 'classifySync',
            },

            // ==================== CHAT OPERATIONS ====================
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['chat'],
                    },
                },
                options: [
                    {
                        name: 'Chat Completion',
                        value: 'chatCompletion',
                        description: 'OpenAI-compatible chat with document understanding',
                        action: 'Chat completion with documents',
                    },
                ],
                default: 'chatCompletion',
            },

            // ==================== INPUT TYPE (Document only) ====================
            {
                displayName: 'Input Type',
                name: 'inputType',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: ['document'],
                    },
                },
                options: [
                    {
                        name: 'URL',
                        value: 'url',
                        description: 'Provide a URL to the document',
                    },
                    {
                        name: 'Binary File',
                        value: 'binary',
                        description: 'Use binary data from a previous node',
                    },
                    {
                        name: 'Base64',
                        value: 'base64',
                        description: 'Provide file content as Base64 string',
                    },
                ],
                default: 'url',
                description: 'How to provide the document',
            },

            // File URL
            {
                displayName: 'File URL',
                name: 'fileUrl',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['document'],
                        operation: ['extractSync', 'extractAsync'],
                        inputType: ['url'],
                    },
                },
                placeholder: 'https://example.com/document.pdf',
                description: 'URL of the document',
            },

            // Binary Property (Document)
            {
                displayName: 'Binary Property',
                name: 'binaryPropertyName',
                type: 'string',
                default: 'data',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['document'],
                        inputType: ['binary'],
                    },
                },
                description: 'Name of the binary property containing the file',
            },

            // Binary Property (Classification)
            {
                displayName: 'Binary Property',
                name: 'binaryPropertyName',
                type: 'string',
                default: 'data',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['classification'],
                    },
                },
                description: 'Name of the binary property containing the file',
            },

            // Base64 Content
            {
                displayName: 'Base64 Content',
                name: 'base64Content',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['document'],
                        operation: ['extractSync', 'extractAsync'],
                        inputType: ['base64'],
                    },
                },
                typeOptions: { rows: 4 },
                description: 'Base64 encoded file content',
            },

            // File Name for Base64
            {
                displayName: 'File Name',
                name: 'fileName',
                type: 'string',
                default: 'document.pdf',
                displayOptions: {
                    show: {
                        resource: ['document'],
                        operation: ['extractSync', 'extractAsync'],
                        inputType: ['base64'],
                    },
                },
                description: 'Name of the file (including extension)',
            },

            // URLs for Batch operations
            {
                displayName: 'File URLs',
                name: 'fileUrls',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['document'],
                        operation: ['extractBatch'],
                        inputType: ['url'],
                    },
                },
                typeOptions: { rows: 4 },
                placeholder: 'https://example.com/doc1.pdf\nhttps://example.com/doc2.pdf',
                description: 'URLs of files to process (one per line, max 50)',
            },

            // ==================== OUTPUT FORMAT (Extract operations) ====================
            {
                displayName: 'Output Format',
                name: 'outputFormat',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: ['document'],
                        operation: ['extractSync', 'extractAsync', 'extractBatch'],
                    },
                },
                options: [
                    { name: 'Markdown', value: 'markdown' },
                    { name: 'JSON', value: 'json' },
                    { name: 'CSV', value: 'csv' },
                ],
                default: 'markdown',
                description: 'The format for extracted content',
            },

            // ==================== CATEGORIES (Classification) ====================
            {
                displayName: 'Categories',
                name: 'categories',
                type: 'fixedCollection',
                typeOptions: {
                    multipleValues: true,
                },
                default: { categoryValues: [] },
                displayOptions: {
                    show: {
                        resource: ['classification'],
                        operation: ['classifySync', 'classifyBatch'],
                    },
                },
                options: [
                    {
                        displayName: 'Category',
                        name: 'categoryValues',
                        values: [
                            {
                                displayName: 'Name',
                                name: 'name',
                                type: 'string',
                                default: '',
                                required: true,
                                description: 'Category name',
                            },
                            {
                                displayName: 'Description',
                                name: 'description',
                                type: 'string',
                                default: '',
                                description: 'Optional description of the category',
                            },
                        ],
                    },
                ],
                description: 'Categories to classify documents into',
            },

            // ==================== CHAT FIELDS ====================
            {
                displayName: 'Message',
                name: 'chatMessage',
                type: 'string',
                typeOptions: { rows: 4 },
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['chat'],
                        operation: ['chatCompletion'],
                    },
                },
                placeholder: 'Extract key information from this document...',
                description: 'The message/question to send',
            },
            {
                displayName: 'Document Input Type',
                name: 'chatInputType',
                type: 'options',
                displayOptions: {
                    show: {
                        resource: ['chat'],
                        operation: ['chatCompletion'],
                    },
                },
                options: [
                    { name: 'URL', value: 'url' },
                    { name: 'Binary File', value: 'binary' },
                ],
                default: 'url',
                description: 'How to provide the document for chat',
            },
            {
                displayName: 'Document URL',
                name: 'chatDocumentUrl',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        resource: ['chat'],
                        operation: ['chatCompletion'],
                        chatInputType: ['url'],
                    },
                },
                placeholder: 'https://example.com/document.pdf',
                description: 'URL of the document to analyze (optional)',
            },
            {
                displayName: 'Binary Property',
                name: 'chatBinaryProperty',
                type: 'string',
                default: 'data',
                displayOptions: {
                    show: {
                        resource: ['chat'],
                        operation: ['chatCompletion'],
                        chatInputType: ['binary'],
                    },
                },
                description: 'Binary property containing the document',
            },
            {
                displayName: 'Model',
                name: 'chatModel',
                type: 'string',
                default: 'nanonets/Nanonets-OCR-s',
                displayOptions: {
                    show: {
                        resource: ['chat'],
                        operation: ['chatCompletion'],
                    },
                },
                description: 'Model to use for chat completion',
            },

            // ==================== RECORD ID (Get Result) ====================
            {
                displayName: 'Record ID',
                name: 'recordId',
                type: 'string',
                required: true,
                default: '',
                displayOptions: {
                    show: {
                        resource: ['document'],
                        operation: ['getResult'],
                    },
                },
                description: 'The record ID from a previous extraction request',
            },

            // ==================== ADDITIONAL FIELDS ====================
            {
                displayName: 'Additional Fields',
                name: 'additionalFields',
                type: 'collection',
                placeholder: 'Add Field',
                default: {},
                displayOptions: {
                    show: {
                        resource: ['document'],
                        operation: ['extractSync', 'extractAsync', 'extractBatch'],
                    },
                },
                options: [
                    {
                        displayName: 'JSON Options',
                        name: 'jsonOptions',
                        type: 'string',
                        default: '',
                        description: 'For JSON output: field list (e.g., ["invoice_number", "total"])',
                    },
                    {
                        displayName: 'Include Bounding Boxes',
                        name: 'includeBoundingBoxes',
                        type: 'boolean',
                        default: false,
                        description: 'Whether to include coordinate data',
                    },
                    {
                        displayName: 'Prompt Mode',
                        name: 'promptMode',
                        type: 'options',
                        options: [
                            { name: 'Append', value: 'append' },
                            { name: 'Replace', value: 'replace' },
                        ],
                        default: 'append',
                        description: 'How to handle custom instructions',
                    },
                    {
                        displayName: 'CSV Options',
                        name: 'csvOptions',
                        type: 'string',
                        default: '',
                        description: 'For CSV output: options (e.g. "table")',
                    },
                    {
                        displayName: 'Include Confidence Score',
                        name: 'includeConfidenceScore',
                        type: 'boolean',
                        default: false,
                        description: 'Whether to include confidence scores',
                    },
                    {
                        displayName: 'Custom Instructions',
                        name: 'customInstructions',
                        type: 'string',
                        typeOptions: { rows: 4 },
                        default: '',
                        description: 'Custom instructions for extraction',
                    },
                ],
            },

            // List Options
            {
                displayName: 'Options',
                name: 'listOptions',
                type: 'collection',
                placeholder: 'Add Option',
                default: {},
                displayOptions: {
                    show: {
                        resource: ['document'],
                        operation: ['listResults'],
                    },
                },
                options: [
                    {
                        displayName: 'Page',
                        name: 'page',
                        type: 'number',
                        default: 1,
                    },
                    {
                        displayName: 'Page Size',
                        name: 'pageSize',
                        type: 'number',
                        default: 10,
                    },
                    {
                        displayName: 'Sort Order',
                        name: 'sortOrder',
                        type: 'options',
                        options: [
                            { name: 'Descending', value: 'desc' },
                            { name: 'Ascending', value: 'asc' },
                        ],
                        default: 'desc',
                    },
                ],
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        const resource = this.getNodeParameter('resource', 0) as string;
        const operation = this.getNodeParameter('operation', 0) as string;

        // Multipart field: either a text field or a binary file field
        type MultipartField =
            | { name: string; value: string }
            | { name: string; value: Buffer; filename: string; contentType: string };

        // Build multipart/form-data body as a Buffer (zero external dependencies)
        const buildMultipart = (fields: MultipartField[]) => {
            const boundary = '----n8nBoundary' + Math.random().toString(36).substring(2);
            const parts: Buffer[] = [];
            for (const field of fields) {
                if ('filename' in field) {
                    parts.push(Buffer.from(
                        `--${boundary}\r\nContent-Disposition: form-data; name="${field.name}"; filename="${field.filename}"\r\nContent-Type: ${field.contentType}\r\n\r\n`,
                    ));
                    parts.push(field.value);
                    parts.push(Buffer.from('\r\n'));
                } else {
                    parts.push(Buffer.from(
                        `--${boundary}\r\nContent-Disposition: form-data; name="${field.name}"\r\n\r\n${field.value}\r\n`,
                    ));
                }
            }
            parts.push(Buffer.from(`--${boundary}--\r\n`));
            return {
                body: Buffer.concat(parts),
                contentType: `multipart/form-data; boundary=${boundary}`,
            };
        };

        // POST with multipart form data
        const multipartPost = async (url: string, fields: MultipartField[]) => {
            const { body, contentType } = buildMultipart(fields);
            return this.helpers.httpRequestWithAuthentication.call(
                this, 'nanonetsApi',
                {
                    method: 'POST',
                    url,
                    body,
                    headers: { 'Content-Type': contentType },
                    json: true,
                },
            );
        };

        // Helper to get file data based on input type
        const getFileData = async (i: number, inputTypeParam = 'inputType') => {
            const inputType = this.getNodeParameter(inputTypeParam, i) as string;

            if (inputType === 'url') {
                const fileUrl = this.getNodeParameter('fileUrl', i) as string;
                return { type: 'url' as const, url: fileUrl };
            } else if (inputType === 'binary') {
                const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
                const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
                const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
                return {
                    type: 'file' as const,
                    value: buffer,
                    filename: binaryData.fileName || 'document.pdf',
                    contentType: binaryData.mimeType || 'application/pdf',
                };
            } else if (inputType === 'base64') {
                const base64Content = this.getNodeParameter('base64Content', i) as string;
                const fileName = this.getNodeParameter('fileName', i) as string;
                const base64Buffer = Buffer.from(base64Content, 'base64');
                const ext = fileName.split('.').pop()?.toLowerCase() || 'pdf';
                const mimeTypes: { [key: string]: string } = {
                    pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg',
                    jpeg: 'image/jpeg', tiff: 'image/tiff', tif: 'image/tiff',
                };
                return {
                    type: 'file' as const,
                    value: base64Buffer,
                    filename: fileName,
                    contentType: mimeTypes[ext] || 'application/octet-stream',
                };
            }
            throw new NodeOperationError(this.getNode(), 'Invalid input type');
        };

        // Convert file data to multipart fields
        const fileToFields = (fileData: { type: 'url'; url: string } | { type: 'file'; value: Buffer; filename: string; contentType: string }): MultipartField[] => {
            if (fileData.type === 'url') {
                return [{ name: 'file_url', value: fileData.url }];
            }
            return [{
                name: 'file',
                value: fileData.value,
                filename: fileData.filename,
                contentType: fileData.contentType,
            }];
        };

        // Helper for metadata options
        const buildMetadata = (additionalFields: IDataObject) => {
            const metadataOptions: string[] = [];
            if (additionalFields.includeBoundingBoxes) metadataOptions.push('bounding_boxes');
            if (additionalFields.includeConfidenceScore) metadataOptions.push('confidence_score');
            return metadataOptions.length > 0 ? metadataOptions.join(',') : undefined;
        };

        // Build common extraction option fields
        const extractionFields = (outputFormat: string, additionalFields: IDataObject): MultipartField[] => {
            const fields: MultipartField[] = [
                { name: 'output_format', value: outputFormat },
            ];
            if (additionalFields.jsonOptions) fields.push({ name: 'json_options', value: additionalFields.jsonOptions as string });
            if (additionalFields.csvOptions) fields.push({ name: 'csv_options', value: additionalFields.csvOptions as string });
            if (additionalFields.promptMode) fields.push({ name: 'prompt_mode', value: additionalFields.promptMode as string });
            if (additionalFields.customInstructions) fields.push({ name: 'custom_instructions', value: additionalFields.customInstructions as string });
            const metadata = buildMetadata(additionalFields);
            if (metadata) fields.push({ name: 'include_metadata', value: metadata });
            return fields;
        };

        for (let i = 0; i < items.length; i++) {
            try {
                // ==================== DOCUMENT OPERATIONS ====================
                if (resource === 'document') {
                    // Extract (Sync)
                    if (operation === 'extractSync') {
                        const fileData = await getFileData(i);
                        const outputFormat = this.getNodeParameter('outputFormat', i) as string;
                        const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

                        const fields: MultipartField[] = [
                            ...extractionFields(outputFormat, additionalFields),
                            ...fileToFields(fileData),
                        ];

                        const response = await multipartPost(
                            'https://extraction-api.nanonets.com/api/v1/extract/sync', fields,
                        );
                        returnData.push({ json: response as IDataObject, pairedItem: { item: i } });
                    }

                    // Extract (Async)
                    if (operation === 'extractAsync') {
                        const fileData = await getFileData(i);
                        const outputFormat = this.getNodeParameter('outputFormat', i) as string;
                        const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

                        const fields: MultipartField[] = [
                            ...extractionFields(outputFormat, additionalFields),
                            ...fileToFields(fileData),
                        ];

                        const response = await multipartPost(
                            'https://extraction-api.nanonets.com/api/v1/extract/async', fields,
                        );
                        returnData.push({ json: response as IDataObject, pairedItem: { item: i } });
                    }

                    // Extract (Batch) - processes all items at once, only runs on first item
                    if (operation === 'extractBatch' && i === 0) {
                        const inputType = this.getNodeParameter('inputType', 0) as string;
                        const outputFormat = this.getNodeParameter('outputFormat', 0) as string;
                        const additionalFields = this.getNodeParameter('additionalFields', 0) as IDataObject;

                        if (inputType === 'url') {
                            const urlsText = this.getNodeParameter('fileUrls', 0) as string;
                            const urls = urlsText.split('\n').map(u => u.trim()).filter(u => u);

                            const fields: MultipartField[] = [
                                ...extractionFields(outputFormat, additionalFields),
                                { name: 'urls', value: JSON.stringify(urls) },
                            ];

                            const response = await multipartPost(
                                'https://extraction-api.nanonets.com/api/v1/extract/batch', fields,
                            );
                            returnData.push({ json: response as IDataObject, pairedItem: { item: 0 } });
                        } else if (inputType === 'binary') {
                            const binaryPropertyName = this.getNodeParameter('binaryPropertyName', 0) as string;
                            const fields: MultipartField[] = [
                                { name: 'output_format', value: outputFormat },
                            ];

                            for (let j = 0; j < Math.min(items.length, 50); j++) {
                                try {
                                    const binaryData = this.helpers.assertBinaryData(j, binaryPropertyName);
                                    const buffer = await this.helpers.getBinaryDataBuffer(j, binaryPropertyName);
                                    fields.push({
                                        name: 'files',
                                        value: buffer,
                                        filename: binaryData.fileName || `document_${j}.pdf`,
                                        contentType: binaryData.mimeType || 'application/pdf',
                                    });
                                } catch {
                                    // Skip items without binary data
                                }
                            }

                            const response = await multipartPost(
                                'https://extraction-api.nanonets.com/api/v1/extract/batch', fields,
                            );
                            returnData.push({ json: response as IDataObject, pairedItem: { item: 0 } });
                        }
                    }

                    // Get Result
                    if (operation === 'getResult') {
                        const recordId = this.getNodeParameter('recordId', i) as string;

                        const response = await this.helpers.httpRequestWithAuthentication.call(
                            this, 'nanonetsApi',
                            { method: 'GET', url: `https://extraction-api.nanonets.com/api/v1/extract/results/${recordId}`, json: true },
                        );

                        returnData.push({ json: response as IDataObject, pairedItem: { item: i } });
                    }

                    // List Results
                    if (operation === 'listResults') {
                        const listOptions = this.getNodeParameter('listOptions', i) as IDataObject;

                        const qs: IDataObject = {
                            page: listOptions.page || 1,
                            page_size: listOptions.pageSize || 10,
                            sort_order: listOptions.sortOrder || 'desc',
                        };

                        const response = await this.helpers.httpRequestWithAuthentication.call(
                            this, 'nanonetsApi',
                            { method: 'GET', url: 'https://extraction-api.nanonets.com/api/v1/extract/results', qs, json: true },
                        );

                        returnData.push({ json: response as IDataObject, pairedItem: { item: i } });
                    }
                }

                // ==================== CLASSIFICATION OPERATIONS ====================
                if (resource === 'classification') {
                    const categoriesData = this.getNodeParameter('categories', i) as { categoryValues?: Array<{ name: string; description?: string }> };
                    const categories = (categoriesData.categoryValues || []).map(c => ({
                        name: c.name,
                        ...(c.description && { description: c.description }),
                    }));

                    // Classify (Sync)
                    if (operation === 'classifySync') {
                        const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
                        const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
                        const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

                        const fields: MultipartField[] = [
                            { name: 'categories', value: JSON.stringify(categories) },
                            {
                                name: 'file',
                                value: buffer,
                                filename: binaryData.fileName || 'document.pdf',
                                contentType: binaryData.mimeType || 'application/pdf',
                            },
                        ];

                        const response = await multipartPost(
                            'https://extraction-api.nanonets.com/api/v1/classify/sync', fields,
                        );
                        returnData.push({ json: response as IDataObject, pairedItem: { item: i } });
                    }

                    // Classify (Batch) - processes all items at once, only runs on first item
                    if (operation === 'classifyBatch' && i === 0) {
                        const binaryPropertyName = this.getNodeParameter('binaryPropertyName', 0) as string;
                        const fields: MultipartField[] = [
                            { name: 'categories', value: JSON.stringify(categories) },
                        ];

                        for (let j = 0; j < Math.min(items.length, 50); j++) {
                            try {
                                const binaryData = this.helpers.assertBinaryData(j, binaryPropertyName);
                                const buffer = await this.helpers.getBinaryDataBuffer(j, binaryPropertyName);
                                fields.push({
                                    name: 'files',
                                    value: buffer,
                                    filename: binaryData.fileName || `document_${j}.pdf`,
                                    contentType: binaryData.mimeType || 'application/pdf',
                                });
                            } catch {
                                // Skip items without binary data
                            }
                        }

                        const response = await multipartPost(
                            'https://extraction-api.nanonets.com/api/v1/classify/batch', fields,
                        );
                        returnData.push({ json: response as IDataObject, pairedItem: { item: 0 } });
                    }
                }

                // ==================== CHAT OPERATIONS ====================
                if (resource === 'chat') {
                    if (operation === 'chatCompletion') {
                        const message = this.getNodeParameter('chatMessage', i) as string;
                        const model = this.getNodeParameter('chatModel', i) as string;
                        const chatInputType = this.getNodeParameter('chatInputType', i) as string;

                        const content: any[] = [];

                        // Add document if provided
                        if (chatInputType === 'url') {
                            const docUrl = this.getNodeParameter('chatDocumentUrl', i) as string;
                            if (docUrl) {
                                content.push({ type: 'file_url', file_url: { url: docUrl } });
                            }
                        } else if (chatInputType === 'binary') {
                            const binaryProp = this.getNodeParameter('chatBinaryProperty', i) as string;
                            try {
                                const binaryData = this.helpers.assertBinaryData(i, binaryProp);
                                const buffer = await this.helpers.getBinaryDataBuffer(i, binaryProp);
                                const base64 = buffer.toString('base64');
                                const mimeType = binaryData.mimeType || 'application/pdf';
                                content.push({
                                    type: 'image_url',
                                    image_url: { url: `data:${mimeType};base64,${base64}` },
                                });
                            } catch {
                                // No binary data, continue without document
                            }
                        }

                        // Add text message
                        content.push({ type: 'text', text: message });

                        const chatBody = {
                            model,
                            messages: [{ role: 'user', content }],
                            stream: false,
                        };

                        const response = await this.helpers.httpRequestWithAuthentication.call(
                            this, 'nanonetsApi',
                            {
                                method: 'POST',
                                url: 'https://extraction-api.nanonets.com/v1/chat/completions',
                                body: chatBody,
                                json: true,
                            },
                        );

                        returnData.push({ json: response as IDataObject, pairedItem: { item: i } });
                    }
                }

            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: { error: (error as Error).message },
                        pairedItem: { item: i },
                    });
                    continue;
                }
                throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
            }
        }

        return [returnData];
    }
}
