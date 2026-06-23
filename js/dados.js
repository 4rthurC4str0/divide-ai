let todasMesas = [
    {
        id: 1,
        numero: 1,
        capacidade: 6,
        status: 'reservada',
        idPedidos: [1],
        criado: new Date(),
    },  
    {
        id: 2,
        numero: 2,
        capacidade: 2,
        status: 'ocupada',
        idPedidos: [1],
        criado: new Date(),
    },
    {
        id: 3,
        numero: 3,
        capacidade: 4,
        status: 'disponivel',
        idPedidos: [1],
        criado: new Date(),
        
    },
];

let itensCardapio = [
    {
        id: '1',
        nome: 'Macarrão brabo',
        descricao: 'Macarrãozim passado na manteiga',
        detalhes: 'Macarrãozim passado na manteiga',
        preco: 60,  
        categoria: 'prato-principal',
        ingredientes: ['Macarrão parafuso', 'Manteiga', 'Sal', 'Salsicha'],
        tempoPreparo: 30,
        alergicos: ['Glutem'],
    },
    {
        id: '2',
        nome: 'Pizza crucante',
        descricao: 'pizzazinha fininha crucante',
        detalhes: 'Sem palavras né',
        preco: 25,
        categoria: 'prato-principal',
        ingredientes: ['Massa crocante', 'Molho de tomate', 'Calabreza', 'Queijo mussarela'],
        tempoPreparo: 30,
        alergicos: ['Glutem'],
    },
    {
        id: '3',
        nome: 'Coca-Cola',
        categoria: 'bebida',
        descricao: 'coquinha gelada',
        preco: 15,
        tempoPreparo: 1,
        detalhes: 'coquinha gelada',
    },
    {
        id: '4',
        nome: 'Pastel',
        categoria: 'entrada',
        descricao: 'Pastelzinho crocante',
        preco: 20,
        tempoPreparo: 20,
        detalhes: 'Pastelzinho crocante',
    }

]

let pedidos = [
    {
        id: 1,
        idMesa: 1,
        numeroMesa: 2,
        items: [
            {
                id: '1',
                idItem: '52',
                nome: 'Pastel',
                quantidade: 4,
                precoUnitario: 20,
                precoTotal: 80,
                done: false,
            },
            {
                id: '2',
                idItem: '51',
                nome: 'Coca-Cola',
                quantidade: 2,
                precoUnitario: 15,
                precoTotal: 30,
                done: false,
            }
        ],
        
        subtotal: 110,
        porcentagemServico: 10,
        couvertArtistico: 15,
        total: 135,
        criado: new Date(Date.now() - 20 * 60000), 
        status: 'pending', 
        notes: '',
    }, 
    {
        id: 1,
        idMesa: 1,
        numeroMesa: 2,
        items: [
            {
                id: '1',
                idItem: '52',
                nome: 'Pastel',
                quantidade: 4,
                precoUnitario: 20,
                precoTotal: 80,
                done: false,
            },
            {
                id: '2',
                idItem: '51',
                nome: 'Coca-Cola',
                quantidade: 2,
                precoUnitario: 15,
                precoTotal: 30,
                done: false,
            }
        ],
        
        subtotal: 110,
        porcentagemServico: 10,
        couvertArtistico: 15,
        total: 135,
        criado: new Date(Date.now() - 20 * 60000), 
        status: 'pending', 
        notes: '',
    }
]

let todosPedidos = [];