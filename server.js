require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OW_API_KEY;

console.log("🔑 Chave da API:", API_KEY);

const cidades = [
  'São Paulo,BR',
  'Damascus,SY',
  'Dhaka,BD'
];

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function buscarClima(cidadeQuery) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidadeQuery)}&appid=${API_KEY}&units=metric&lang=pt_br`;
  console.log(`🔍 Buscando clima para: ${cidadeQuery}`);
  console.log(`🌐 URL: ${url}`);

  try {
    const { data } = await axios.get(url);

    return {
      cidade: data.name,
      temperaturaAtual: `${Math.round(data.main.temp)}°C`,
      temperaturaMaxima: `${Math.round(data.main.temp_max)}°C`,
      temperaturaMinima: `${Math.round(data.main.temp_min)}°C`,
      vento: `${Math.round(data.wind.speed * 3.6)} km/h`,
      clima: data.weather.map(w => w.description).join(', '),
      atualizadoEm: new Date(data.dt * 1000).toLocaleString('pt-BR')
    };
  } catch (error) {
    const mensagem = error.response?.data?.message || error.message;
    console.error(`❌ Erro ao buscar clima de ${cidadeQuery}: ${mensagem}`);
    return {
      cidade: cidadeQuery,
      erro: `Erro: ${mensagem}`
    };
  }
}

app.get('/weather', async (req, res) => {
  const resultados = await Promise.all(cidades.map(buscarClima));
  res.json({ cidades: resultados });
});

app.listen(PORT, () => {
  console.log(`🌤️ Servidor rodando em http://localhost:${PORT}`);
});