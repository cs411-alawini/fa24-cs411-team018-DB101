import express from 'express';
import cors from 'cors';
import path from 'path';
import userRouters from './routes/userRoutes';
import rankingRoutes from './routes/rankingRoutes';
import universityRoutes from './routes/universityRoutes';
import admissionRoutes from './routes/admissionRoutes';
import commentRoutes from './routes/commentRoutes';
const app = express();
const PORT = process.env.PORT || 3007;

// app.use(express.static(path.join(__dirname, '../client/build')));

app.use(cors());
app.use(express.json());
app.use('/api/ranking', rankingRoutes);

app.get('/api/', (req, res) => {
    res.send('Home page');
});
app.use('/api/user', userRouters);
app.use('/api/university', universityRoutes);
app.use('/api/admission',admissionRoutes);
app.use('/api/comment', commentRoutes);
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
// });
// app.use("/api/pokemon", pokemonRoutes);
// app.use("/api/pokemon-spawns", pokemonSpawnRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});