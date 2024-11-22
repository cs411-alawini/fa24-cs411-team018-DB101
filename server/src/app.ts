import express from 'express';
import cors from 'cors';
import path from 'path';
import userRouters from './routes/userRoutes';

const app = express();
const PORT = process.env.PORT || 3007;

// app.use(express.static(path.join(__dirname, '../client/build')));

app.use(cors());
app.use(express.json());

app.get('/api/', (req, res) => {
    res.send('Home page');
});
app.use('/api/user', userRouters);

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
// });
// app.use("/api/pokemon", pokemonRoutes);
// app.use("/api/pokemon-spawns", pokemonSpawnRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});