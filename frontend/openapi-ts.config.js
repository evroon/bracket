import {defineConfig} from '@hey-api/openapi-ts';

export default defineConfig({
  input: '../backend/openapi/openapi.json', 
  output: 'src/openapi',
  plugins: ['@hey-api/client-axios'], 
});