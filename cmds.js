

const {log, biglog, errorlog, colorize} = require("./out");
//accedo directamente a la propiedad de sequelize
//en vez de llamar sequelize.models.quiz pondre models.quiz
const {models} = require('./model');
const Sequelize = require('sequelize');


exports.helpCmd = rl => {
    log("Commandos:");
    log("  h|help - Muestra esta ayuda.");
    log("  list - Listar los quizzes existentes.");
    log("  show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
    log("  add - Añadir un nuevo quiz interactivamente.");
    log("  delete <id> - Borrar el quiz indicado.");
    log("  edit <id> - Editar el quiz indicado.");
    log("  test <id> - Probar el quiz indicado.");
    log("  p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log("  credits - Créditos.");
    log("  q|quit - Salir del programa.");
    rl.prompt();
};

/*
//list con .help funciona
exports.listCmd = rl => {
    models.quiz.findAll()
    .each(quiz => {
        log(` [${colorize(quiz.id, 'magenta')}]:  ${quiz.question}`);
    })
    .catch(error=>{errorlog(error.message);})
    .then(()=>  {rl.prompt();
    });

};
*/

//list con async funciona
exports.listCmd = async(rl) => {
try{
const quizzes = await models.quiz.findAll();
quizzes.forEach(quiz=>{  log(` [${colorize(quiz.id, 'magenta')}]:  ${quiz.question}`);
});
}catch(  error  ){errorlog(error.message);}
  rl.prompt();
};


const validateId=id=>{
  return new Sequelize.Promise((resolve,reject) => {
    if (typeof id === "undefined"){
      reject(new Error(`Falta el parametro ${id}.`));
    }else{
      id=parseInt(id);
      if(Number.isNaN(id)){
    reject(new Error(`El valor del parametro id no es un numero`));
  }else{
    resolve(id);
  }
    }
  });
};

/*
//show con .help funciona
exports.showCmd = (rl, id) => {
  validateId(id)
  .then(id=>models.quiz.findById(id))
  .then(quiz=>{
    if(!quiz){throw new Error(`No hay ningun quiz con id = ${id}.`);}
    log(` [${colorize(id, 'magenta')}]:  ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);})
  .catch((error)=>{errorlog(error.message);})
  .then(()=>{rl.prompt();});
};
*/


//show con async funciona
exports.showCmd = async(rl,id)=>{
  try{
  const valipromise = await validateId(id);
  const quiz = await models.quiz.findById(id);
  if (!quiz){throw new Error(`No hay ningun quiz con id = ${id}.`);}
  log(` [${colorize(id, 'magenta')}]:  ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
}catch(error){errorlog(error.message);}
rl.prompt();
};


const makeQuestion=(rl,text)=>{//nunca rechaza nada, no protege, solo crea la promesa
  return new Sequelize.Promise((resolve,reject)=>{
    rl.question(colorize(text,'red'),myanswer=>{
      resolve(myanswer);//no la voy a trimmear aqui
    });
  });
};

/*
//add con .help funciona
 exports.addCmd = rl => {
   makeQuestion(rl,'Introduzca una pregunta: ')
   .then(q=>{
     return makeQuestion(rl,'Introduzca respuesta: ') //como incluye un then dentro de un then hay que poner un return
      .then(a=>{return{question:q,answer:a};});
 })
   .then(quiz=>{return models.quiz.create(quiz);})
   .then(quiz=>{log(`${colorize('se ha añadido','magenta')} : ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}  `);})
   .catch(Sequelize.ValidationError,error=>{errorlog('el quiz es erroneo:');error.errors.forEach(({message})=>errorlog(message));})
   .catch(error=>{errorlog(error.message);})
   .then(()=>{rl.prompt();});
 };
*/


 //add con async funciona
exports.addCmd = async(rl) =>{
  try{
  const qpromise = await makeQuestion(rl, 'Introduzca una pregunta: ');
  const anspromise = await makeQuestion(rl,'Introduzca una respuesta: ');
  const quiznuevo = {question:qpromise,answer:anspromise};
  const cre = await models.quiz.create(quiznuevo);
  log(`${colorize('se ha añadido','magenta')} : ${quiznuevo.question} ${colorize('=>','magenta')} ${quiznuevo.answer}  `);
}catch(error){errorlog(error.message);}
  rl.prompt();
};


exports.deleteCmd = (rl, id) => {
    validateId(id)
    .then(id=>{  models.quiz.destroy({where:{id}}) })
    .catch(error=>{errorlog(error.message);})
    .then(()=>{rl.prompt();});
  };

/*
//edit con .help funciona
exports.editCmd = (rl, id) => {
    validateId(id)
    .then(id=>models.quiz.findById(id))
    .then(quiz=>{
      if(!quiz){
        throw new Error(`No existe un quiz asociado al id = ${id}.`);
      }
     process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
     return makeQuestion(rl,"Introduzca la pregunta: ")
     .then(q=>{
          process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
          return makeQuestion(rl,"Introduzca la respuesta: ")
          .then(a=>{
            quiz.question=q;
            quiz.answer=a;
            return quiz;
          });
        });
      })
      .then(quiz=>{
        return quiz.save();
      })
      .then(quiz=>{
        log(`Se ha cambiado el quiz ${colorize(quiz.id,'magenta')} por: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
      })
      .catch(Sequelize.ValidationError,error=>{
        errorlog('El quiz es erroneo');
        error.errors.forEach(({message})=>errorlog(message));
      })
      .catch(error=>{
        errorlog(error.message);
      })
      .then(()=>{
        rl.prompt();
      });
    };
*/

//edit con async funciona
exports.editCmd = async(rl, id) => {
  try{
    const vprom = await validateId(id);
    const quiz = await models.quiz.findById(id);
      if(!quiz){throw new Error(`No hay ningun quiz con id = ${id}.`);}
    process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
    const qprom = await makeQuestion(rl,'Introduzca una pregunta: ');
    process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
   const ansprom = await makeQuestion(rl,'Introduzca una respuesta: ');
   quiz.question = await qprom;
   quiz.answer = await ansprom;
   const sa = quiz.save();
   log(`${colorize('se ha actualizado con','magenta')} : ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}  `);
 }catch(error){errorlog(error.message);}
   rl.prompt();
};

/*
//test con .then
exports.testCmd=(rl,id)=>{
  validateId(id)
  .then((id)=>{
    return models.quiz.findById(id)
      .then((quiz)=> {
        return makeQuestion(rl,`${quiz.question}? `)
          .then((answ)=>{
                if(answ.trim().toLowerCase()===quiz.answer.trim().toLowerCase()){
                    biglog('Correcto','bgGreen');
                    }else{biglog('Incorrecto','bgRed');}
  })
})
})
  .catch(error=>{errorlog(error.message);})
  .then(()=>{rl.prompt();});

};
*/


 //test funciona bien con async
exports.testCmd = async(rl, id) => {
  try{
    const vprom = await validateId(id);
    const quiz = await models.quiz.findByPk(id);
    if(!quiz){throw new Error(`No hay ningun quiz con id = ${id}.`);}
    const myanswer = await makeQuestion(rl,`${quiz.question}? `);
    const myanswerok = await myanswer.trim().toLowerCase();
    const theanswerok = await quiz.answer.trim().toLowerCase();
    if(myanswerok===theanswerok){biglog('Correcto','bgGreen');log('/\bcorrect/img');rl.prompt();}
    else {biglog('Incorrecto','bgRed');rl.prompt();}
      }catch(error) {errorlog(error.message);
  rl.prompt();}
};


//play con async
 exports.playCmd = async(rl) => {
   try{
     let score =0;
     let idsNotYetResolved=[];
     const todos = await models.quiz.findAll();
     let m =0;
     todos.forEach(qui=>{idsNotYetResolved[m]=qui.id;m++;});

     const playBien=async()=>{
       if(idsNotYetResolved.length===0){
         log(`No hay nada más que preguntar.\n`)
         log(`Fin del juego, aciertos: ${score} `)
         biglog(`${score}`);
         rl.prompt();
       }
       else{
         let posi=Math.round( Math.random()*(idsNotYetResolved.length-1) );
         let idalazar = idsNotYetResolved[ posi ];
         idsNotYetResolved.splice(posi,1);
         const quiz = await models.quiz.findById(idalazar);
         const ansprom = await makeQuestion(rl,`${quiz.question}? `);
             if(ansprom.trim().toLowerCase()===quiz.answer.trim().toLowerCase()){
                 score=score+1;
                 log('/aciertos:\s+1| 1\s+acierto/img');
                 log(`CORRECTO correct - Lleva ${score} aciertos: ${score} `,'bgGreen');
                 playBien();
             }else{
               log(`INCORRECTO. \n`)
               log(`Fin del juego, aciertos: ${score}, a tu casa`,'bgRed');
               biglog(`${score}`);
               rl.prompt();
             }
       }
     };
     playBien();
   }catch(error){
     errorlog(error.message);
     rl.prompt();
   }
 };




exports.creditsCmd = rl => {
    log('Autores de la práctica:');
    log('Alicia Soria', 'green');
    rl.prompt();
};


exports.quitCmd = rl => {
    rl.close();
};
