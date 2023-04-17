const { Router } = require('express');
const { getAllDogs } = require('../Controllers/Controllers');

// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const { Dog, Temperament } = require('../db')
const router = Router();
const axios = require('axios');
const {Sequelize, Model} = require('sequelize');
const e = require('express');


// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

//! GET DOGS
router.get('/dogs', async (req,res) => {
    const name = req.query.name;
    const allDogs = await getAllDogs();
    try {
        if(name) {
            const dogSelected = allDogs.filter((dog) => dog.name.toLowerCase().includes(name.toLowerCase()))
            dogSelected ? 
            res.status(200).send(dogSelected) :   
            res.status(404).send({error: error.message})
        } else {
            res.status(201).json(allDogs)
        }     
    } catch (error) {
        res.status(404).send({error: error.message})
    }
});

//! GET DOGS/:IDRAZA
router.get('/dogs/:idRaza', async (req,res) => {
    const { idRaza } = req.params;
    const allDogs = await getAllDogs();
    try {
        // Filtro para encontrar el perro con el id enviado por params
        const dogSelected = allDogs.filter((dog) => dog.id == idRaza)
        if(dogSelected.length){
            return res.status(200).send(dogSelected)
        }
    } catch (error) {
        return res.status(404).send({error: error.message})
    }
});

//! GET TEMPERAMENTS
router.get('/temperaments', async (req,res) => {
    try {
        const api = await axios.get('https://api.thedogapi.com/v1/breeds')
        const perros = await api.data.map (el => el.temperament)
        let perrosSplit = await perros.join().split(',')
        let perrosTrim = await perrosSplit.map(e => e.trim())
        await perrosTrim.forEach( async (e) => {
            if(e.length > 0){
                await Temperament.findOrCreate({
                    where : {name : e}
                })
            }
        })
        const allTemperament = await Temperament.findAll()
        // console.log(allTemperament)
        return res.status(200).json(allTemperament)
    }catch (error){
            res.status(404).send({error: 'There are not temperaments'})
        }
})

//! POST DOGS
router.post('/dogs', async (req,res) => {
    let {
            name,
            height_min,
            height_max,
            weight_min,
            weight_max,
            lifeTime,
            temperament,
            createdInDb
    } = req.body;

    let dogCreated = await Dog.create ({
        name,
        height_min,
        height_max,
        weight_min,
        weight_max,
        lifeTime,
        createdInDb
    })

    let temperamentDb = await Temperament.findAll( {
        where: { name: temperament}
    })
    dogCreated.addTemperament(temperamentDb)
    res.send('Perro agregado con éxito.')
})


module.exports = router;
