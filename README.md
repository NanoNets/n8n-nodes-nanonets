# n8n-nodes-nanonets

This is an n8n community node for [Nanonets](https://nanonets.com) Document Extraction API.

**Get 10,000 free credits** when you sign up at [nanonets.com](https://nanonets.com).

## Features

Extract data from documents (PDFs, images) with high accuracy using Nanonets AI:

- **Extract (Sync)** - Synchronous document extraction
- **Extract (Async)** - Queue documents for asynchronous processing
- **Extract (Batch)** - Process up to 50 files in a single batch
- **Classify (Sync)** - Classify documents into categories
- **Classify (Batch)** - Classify multiple documents in a batch
- **Chat Completion** - OpenAI-compatible chat with document understanding
- **Get Result** - Retrieve results for async extractions
- **List Results** - List all recent extraction results

### Output Formats

- **Markdown** - Clean markdown with tables and formatting
- **JSON** - Structured data with custom schemas or field lists
- **CSV** - Table data extraction

### Input Support

- **URL** - Provide document URL
- **Binary File** - Use binary data from previous nodes
- **Base64** - Provide file content as Base64 string

### Additional Options

- Bounding boxes for coordinate data
- Confidence scores for extracted fields
- Custom instructions for specialized extraction
- Financial document optimization

## Installation

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes** in n8n
2. Select **Install**
3. Enter `n8n-nodes-nanonets` and click Install

### Manual Installation

```bash
# In your n8n installation directory
cd ~/.n8n/nodes
npm install n8n-nodes-nanonets
```

## Credentials

1. Sign up at [nanonets.com](https://app.nanonets.com)
2. Get your API key from the dashboard
3. In n8n, create new credentials for "Nanonets API"
4. Enter your API key

## Usage Example

### Basic Extraction

1. Add a **Read Binary File** node with your PDF
2. Add a **Nanonets** node
3. Set Operation to "Extract (Sync)"
4. Set Output Format to "Markdown" or "JSON"
5. Execute the workflow

### JSON Extraction with Fields

1. Set Output Format to "JSON"
2. In Additional Fields > JSON Options, enter:
   - Field list: `["invoice_number", "date", "total_amount"]`
   - Or use `hierarchy_output` for document structure

## Resources

- [Nanonets API Documentation](https://docstrange.nanonets.com/docs)
- [n8n Community Nodes Docs](https://docs.n8n.io/integrations/community-nodes/)

## License

MIT
