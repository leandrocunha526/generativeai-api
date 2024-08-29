# Generative AI API

## About

- API in Node.js using TypeScript,
- Use database modeling,
- Using Docker.
`The Docker command is docker compose -f docker-compose.yml up.`
- API endpoint to upload a image using generative AI model returning a value.
- Gemini Generative AI API integration.

## Execute

- Install the dependencies: `yarn`.
- Run the API: `yarn run dev` (watch mode is enabled with ts-node-dev).

- Open a web browser and navigate to `http://localhost:3000` to interact with the API.

## Requests  and responses examples

localhost:3000/upload (POST)

- Request Body: file (image in base64)

```json
{
"image": "the base64 code",
"customer_code": "string",
"measure_datetime": "datetime",
"measure_type": "WATER"
}
```

localhost:3000/customerCode/list?measure_type=WATER or GAS (GET)

```json
{
 "customer_code": "CustomerCode",
 "measures": [
  {
   "id": "a40bf06a-c7b2-49ec-b752-2fa029b7314e",
   "measureType": "WATER",
   "measureValue": 1,
   "hasConfirmed": true,
   "measureDatetime": "2024-08-29T15:38:00.000Z",
   "imageUrl": "URI",
   "customerCode": "CustomerCode",
   "createdAt": "2024-08-29T19:21:17.139Z",
   "updatedAt": "2024-08-29T20:09:45.184Z"
  }
 ]
}
```

localhost:3000/confirm (PATCH)

```json
{
 "success": true
}
```

The attribute hasConfirmed is true return true and if false return false.  
No endpoint permit duplicate request or data invalid (tested).

More information in [REST API Tutorial - Introduction](https://www.restapitutorial.com/introduction).

## LICENSE

[MIT License](LICENSE.md)
