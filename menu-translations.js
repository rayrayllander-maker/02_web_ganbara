// Traducciones de los platos del menú en euskera
const menuTranslations = {
    bocadillos: {
        1: {
            es: "Vegetal de pollo",
            eu: "Oilasko begetala",
            descEs: "Pechuga, lechuga, tomate, york, queso, mayonesa, atún, huevo cocido",
            descEu: "Bularreko, letxuga, tomatea, york, gazta, maionesa, atuna, arrautza egosi"
        },
        2: {
            es: "Tortillas Variadas",
            eu: "Tortilla Denetarikoak",
            descEs: "Chorizo, patata, jamón o champis",
            descEu: "Txorizo, patata, urdaiazpiko edo perretxiko"
        },
        3: {
            es: "Bacon, queso y pimientos",
            eu: "Bacon, gazta eta piperrak",
            descEs: "Bacon, queso, pimientos",
            descEu: "Bacon, gazta, piperrak"
        },
        4: {
            es: "Lomo, queso y pimientos",
            eu: "Sabelpeko, gazta eta piperrak",
            descEs: "Lomo, queso, pimientos",
            descEu: "Sabelpeko, gazta, piperrak"
        },
        5: {
            es: "Pechuga, queso y pimientos",
            eu: "Bularreko, gazta eta piperrak",
            descEs: "Pechuga, queso, pimientos",
            descEu: "Bularreko, gazta, piperrak"
        },
        6: {
            es: "Pechuga rebozada con alioli, bacon y cebolla",
            eu: "Bularreko kuluskaduna alioli, bacon eta tipularekin",
            descEs: "Pechuga rebozada, alioli, bacon, cebolla",
            descEu: "Bularreko kuluskaduna, alioli, bacon, tipula"
        },
        7: {
            es: "Jamón ibérico, queso, setas y tomate a la plancha",
            eu: "Urdaiazpiko iberikoa, gazta, perretxiko eta tomatea plantxan",
            descEs: "Jamón ibérico, queso, setas, tomate a la plancha",
            descEu: "Urdaiazpiko iberikoa, gazta, perretxiko, tomatea plantxan"
        },
        8: {
            es: "Jamón ibérico",
            eu: "Urdaiazpiko iberikoa",
            descEs: "Jamón ibérico",
            descEu: "Urdaiazpiko iberikoa"
        },
        9: {
            es: "ESPECIAL: Jamón, pimientos verdes, queso Idiazabal y setas",
            eu: "BEREZIA: Urdaiazpikoa, piper berdeak, Idiazabal gazta eta perretxikoak",
            descEs: "Jamón, pimientos verdes, queso Idiazabal, setas",
            descEu: "Urdaiazpikoa, piper berdeak, Idiazabal gazta, perretxikoak"
        },
        10: {
            es: "Pechuga crujiente con mermelada y queso Camembert",
            eu: "Bularreko kurruskaria mermelada eta Camembert gaztarekin",
            descEs: "Pechuga crujiente, mermelada, queso Camembert",
            descEu: "Bularreko kurruskaria, mermelada, Camembert gazta"
        },
        11: {
            es: "VEGETARIANA",
            eu: "BEGETARIANOA",
            descEs: "Calabacín, pimientos verdes, cebolla morada, tomate, guacamole, huevo y queso danés",
            descEu: "Kalabazina, piper berdeak, tipula morea, tomatea, guacamole, arrautza eta gazta daniarra"
        }
    },
    raciones: {
        1: {
            es: "Paletilla de jamón ibérico",
            eu: "Urdaiazpiko iberikoaren sorbalda",
            descEs: "Paletilla de jamón ibérico. Media ración: €9",
            descEu: "Urdaiazpiko iberikoaren sorbalda. Erdi-razio: €9"
        },
        2: {
            es: "Rabas (calamar rebozado)",
            eu: "Txipiroiak (kuluskadura)",
            descEs: "Calamar rebozado. Media ración: €5,5",
            descEu: "Txipiroi kuluskadura. Erdi-razio: €5,5"
        },
        3: {
            es: "Rabas, cebolla crujiente y alioli",
            eu: "Txipiroiak, tipula kurruskaria eta alioli",
            descEs: "Rabas, cebolla crujiente, alioli",
            descEu: "Txipiroiak, tipula kurruskaria, alioli"
        },
        4: {
            es: "Patata casera Brava o alioli",
            eu: "Etxeko patata Brava edo alioli",
            descEs: "Patata casera, salsa brava o alioli",
            descEu: "Etxeko patata, saltsa brava edo alioli"
        },
        5: {
            es: "Patata casera Braviolí",
            eu: "Etxeko patata Braviolí",
            descEs: "Patata casera, salsa brava y alioli",
            descEu: "Etxeko patata, saltsa brava eta alioli"
        },
        6: {
            es: "Croquetas de jamón o de hongos",
            eu: "Urdaiazpiko edo perretxiko kroketak",
            descEs: "Croquetas de jamón o de hongos",
            descEu: "Urdaiazpiko edo perretxiko kroketak"
        },
        7: {
            es: "Champis con gambas a la vinagreta",
            eu: "Perretxikoak izkirekin vinagretarekin",
            descEs: "Champiñones, gambas, vinagreta",
            descEu: "Perretxikoak, izkira, vinagreta"
        },
        8: {
            es: "Pizzas de pollo crujiente con patatas",
            eu: "Oilasko kurruskariaren pizzak patatarekin",
            descEs: "Pollo crujiente, patatas",
            descEu: "Oilasko kurruskaria, patatak"
        },
        9: {
            es: "Pimientos verdes",
            eu: "Piper berdeak",
            descEs: "Pimientos verdes",
            descEu: "Piper berdeak"
        },
        10: {
            es: "Patatas Ganbara",
            eu: "Ganbara patatak",
            descEs: "Patatas caseras, bacón crujiente, salsa cheddar",
            descEu: "Etxeko patatak, bacon kurruskaria, cheddar saltsa"
        },
        11: {
            es: "Tequeños de guayaba y queso",
            eu: "Guaiaba eta gaztadun tequeñoak",
            descEs: "Tequeños, guayaba, queso",
            descEu: "Tequeñoak, guaiaba, gazta"
        }
    },
    hamburguesas: {
        1: {
            es: "GANBARA",
            eu: "GANBARA",
            descEs: "180 gr. Angus, doble bacon, queso danés, cebolla caramelizada, huevo, tomate. Carne: 180 gr. Angus",
            descEu: "180 gr. Angus haragia, bacon bikoitza, gazta daniarra, tipula karamelizatua, arrautza, tomatea. Haragia: 180 gr. Angus"
        },
        2: {
            es: "GOLOSA",
            eu: "GOLOSA",
            descEs: "180 gr. Angus, doble bacon, queso cheddar, miel y mostaza, lechuga, tomate, cebolla. Carne: 180 gr. Angus",
            descEu: "180 gr. Angus haragia, bacon bikoitza, cheddar gazta, eztia eta mostaza, letxuga, tomatea, tipula. Haragia: 180 gr. Angus"
        },
        3: {
            es: "FRANCESA",
            eu: "FRANCESA",
            descEs: "180 gr. Angus, doble bacon, queso Camembert, champis laminados, cebolla. Carne: 180 gr. Angus",
            descEu: "180 gr. Angus haragia, bacon bikoitza, Camembert gazta, perretxiko laminatuak, tipula. Haragia: 180 gr. Angus"
        },
        4: {
            es: "SERRANA",
            eu: "SERRANA",
            descEs: "180 gr. Angus, jamón, queso danés, cebolla morada, hilos de patata, salsa tártara. Carne: 180 gr. Angus",
            descEu: "180 gr. Angus haragia, urdaiazpikoa, gazta daniarra, tipula morea, patata hariak, tártara saltsa. Haragia: 180 gr. Angus"
        },
        5: {
            es: "EMMY",
            eu: "EMMY",
            descEs: "180 gr. Angus, doble bacon, queso cheddar, cebolla caramelizada, pepinillos, huevo, salsa Emmy. Carne: 180 gr. Angus",
            descEu: "180 gr. Angus haragia, bacon bikoitza, cheddar gazta, tipula karamelizatua, pepinilloak, arrautza, Emmy saltsa. Haragia: 180 gr. Angus"
        },
        6: {
            es: "COLOMBIANA",
            eu: "COLOMBIANA",
            descEs: "180 gr. Angus, doble bacon, queso cheddar, hilos de patata, 70 gr. carne mechada, salsa de piña. Carne: 180 gr. Angus + 70 gr. mechada",
            descEu: "180 gr. Angus haragia, bacon bikoitza, cheddar gazta, patata hariak, 70 gr. haragi xehatua, anana saltsa. Haragia: 180 gr. Angus + 70 gr. xehatua"
        },
        7: {
            es: "BACONESSA",
            eu: "BACONESSA",
            descEs: "180 gr. Angus, doble queso danés, doble bacon, bacon crispy, cebolla crispy, huevo, salsa Bacón. Carne: 180 gr. Angus",
            descEu: "180 gr. Angus haragia, gazta daniar bikoitza, bacon bikoitza, bacon crispy, tipula crispy, arrautza, Bacon saltsa. Haragia: 180 gr. Angus"
        },
        8: {
            es: "BBQ",
            eu: "BBQ",
            descEs: "180 gr. Angus, doble bacon, queso danés, cebolla, chaskis, salsa Barbacoa. Carne: 180 gr. Angus",
            descEu: "180 gr. Angus haragia, bacon bikoitza, gazta daniarra, tipula, chaskis, Barbakoa saltsa. Haragia: 180 gr. Angus"
        },
        9: {
            es: "AZTECA",
            eu: "AZTECA",
            descEs: "180 gr. Angus, queso cheddar, cebolla crispy, jalapeño, guacamole, nachos, salsa de jalapeño asado. Carne: 180 gr. Angus",
            descEu: "180 gr. Angus haragia, cheddar gazta, tipula crispy, jalapeño, guacamole, nachos, jalapeño errea saltsa. Haragia: 180 gr. Angus"
        },
        10: {
            es: "CLÁSICA",
            eu: "KLASIKOA",
            descEs: "180 gr. Angus, doble bacon, queso cheddar, Salsa Burger. Carne: 180 gr. Angus",
            descEu: "180 gr. Angus haragia, bacon bikoitza, cheddar gazta, Burger saltsa. Haragia: 180 gr. Angus"
        },
        11: {
            es: "VEGETARIANA",
            eu: "BEGETARIANOA",
            descEs: "Carne Eura (Vegetariana), queso cheddar, lechuga, tomate, cebolla morada, huevo. Carne: Eura (Vegetariana)",
            descEu: "Eura haragia (Begetarianoa), cheddar gazta, letxuga, tomatea, tipula morea, arrautza. Haragia: Eura (Begetarianoa)"
        }
    },
    chuleta: {
        1: {
            es: "GANBARA TURBO",
            eu: "GANBARA TURBO",
            descEs: "200 gr. Txuleta, doble bacon, queso cheddar, cebolla caramelizada, 70 gr. carne mechada, salsa guasacaca. Carne: 200 gr. Chuleta + 70 gr. mechada",
            descEu: "200 gr. Txuleta haragia, bacon bikoitza, cheddar gazta, tipula karamelizatua, 70 gr. haragi xehatua, guasacaca saltsa. Haragia: 200 gr. Txuleta + 70 gr. xehatua"
        },
        2: {
            es: "EUSKALDUNA",
            eu: "EUSKALDUNA",
            descEs: "200 gr. Txuleta, doble bacon, queso Idiazabal, huevo. Carne: 200 gr. Chuleta",
            descEu: "200 gr. Txuleta haragia, bacon bikoitza, Idiazabal gazta, arrautza. Haragia: 200 gr. Txuleta"
        }
    },
    postres: {
        1: {
            es: "Tarta de queso",
            eu: "Gazta tarta",
            descEs: "Tarta de queso",
            descEu: "Gazta tarta"
        },
        2: {
            es: "Coulant de chocolate",
            eu: "Txokolate coulant",
            descEs: "Coulant de chocolate",
            descEu: "Txokolate coulant"
        }
    }
};
