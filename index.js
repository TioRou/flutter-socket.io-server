const express = require('express');
const path = require('path');
const Band = require('./public/models/band');
const Bands = require('./public/models/bands');
require('dotenv').config();

// App de Express
const app = express();

// Path público
const publicPath = path.resolve(__dirname, 'public');

app.use(express.static(publicPath));

// Node server
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Listado de Bandas
const bands = new Bands();

bands.addBand(new Band('Queen'));
bands.addBand(new Band('Bon Jovi'));
bands.addBand(new Band('Héroes del Silencio'));
bands.addBand(new Band('Metallica'));

// Mensajes de Sockets
io.on('connection', client => {
    console.log('Cliente conectado');

    client.emit('active-bands', bands.getBands());

    client.on('disconnect', () => {
        console.log('Cliente desconectado');
    });

    client.on('nuevo-mensaje', (payload) => {
        // emite a todos //
        // io.emit('nuevo-mensaje', payload); 
        
        // emite a todos menos al que lo emitio //
        client.broadcast.emit('nuevo-mensaje, payload'); 
    });

    client.on('vote-band', (payload) => {

        bands.voteBand(payload.id);

        io.emit('active-bands', bands.getBands());

        //console.log('ID de la banda', payload.id);
    });

    client.on('add-band', (payload) => {

        bands.addBand(new Band(payload.name));

        io.emit('active-bands', bands.getBands());
    });

    client.on('delete-band', (payload) => {

        console.log('que pasa aqui');

        bands.deleteBand(payload.id);

        io.emit('active-bands', bands.getBands());
    });

    // client.on('emitir-mensaje', (payload) => {
    //     console.log(payload);
        
    //     // emite a todos menos al que lo emitio //
    //     client.broadcast.emit('nuevo-mensaje', payload); 
    // });
});

server.listen(process.env.PORT, (err) => {
    if (err) throw new Error(err);

    console.log('Servidor corriendo en puerto!!!', process.env.PORT);
});