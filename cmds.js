

const {log, biglog, errorlog, colorize} = require("./out");
//accedo directamente a la propiedad de sequelize
//en vez de llamar sequelize.models.quiz pondre models.quiz
const {models} = require('./model');
const Sequelize = require('sequelize');


/**
 * Muestra la ayuda.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
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


/**
 * Lista todos los quizzes existentes en el modelo.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */

exports.listCmd = rl => {
    models.quiz.findAll()
    .each(quiz => {
        log(` [${colorize(quiz.id, 'magenta')}]:  ${quiz.question}`);
    })
    .catch(error=>{errorlog(error.message);})
    .then(()=>  {rl.prompt();
    });

};

//intenta esto luego FUNCIONA
/*
exports.listCmd = async(rl) => {
try{
const quizzes = await models.quiz.findAll();
quizzes.forEach(quiz=>{  log(` [${colorize(quiz.id, 'magenta')}]:  ${quiz.question}`);});
}catch(  error  ){errorlog(error.message);}
  rl.prompt();
};
*/

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
/**
 * Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a mostrar.
 */
exports.showCmd = (rl, id) => {
  validateId(id)
  .then(id=>models.quiz.findById(id))
  .then(quiz=>{
    if(!quiz){throw new Error(`No hay ningun quiz con id = ${id}.`);}
    log(` [${colorize(id, 'magenta')}]:  ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);})
  .catch((error)=>{errorlog(error.message);})
  .then(()=>{rl.prompt();});
};

//prueba esto FUNCIONA
/*
exports.showCmd = async(rl,id)=>{
  try{
  const valipromise = await validateId(id);
  const quiz = await models.quiz.findById(id);
  if (!quiz){throw new Error(`No hay ningun quiz con id = ${id}.`);}
  log(` [${colorize(id, 'magenta')}]:  ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);

}catch(error){errorlog(error.message);}
rl.prompt();
};
*/


//auxiliar para hacer rl.question
const makeQuestion=(rl,text)=>{//nunca rechaza nada, no protege, solo crea la promesa
  return new Sequelize.Promise((resolve,reject)=>{
    rl.question(colorize(text,'red'),myanswer=>{
      resolve(myanswer);//no la voy a trimmear aqui
    });
  });
};
/**
 * Añade un nuevo quiz al módelo.
 * Pregunta interactivamente por la pregunta y por la respuesta.
 *
 * Hay que recordar que el funcionamiento de la funcion rl.question es asíncrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
 * es decir, la llamada a rl.prompt() se debe hacer en la callback de la segunda
 * llamada a rl.question.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */

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

 /*
 //ESTAMIERDAFUNCIONA
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
*/

/**
 * Borra un quiz del modelo.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a borrar en el modelo.
 */
exports.deleteCmd = (rl, id) => {
    validateId(id)
    .then(id=>{  models.quiz.destroy({where:{id}}) })
    .catch(error=>{errorlog(error.message);})
    .then(()=>{rl.prompt();});
  };

/**
 * Edita un quiz del modelo.
 *
 * Hay que recordar que el funcionamiento de la funcion rl.question es asíncrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
 * es decir, la llamada a rl.prompt() se debe hacer en la callback de la segunda
 * llamada a rl.question.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a editar en el modelo.
 */
/*
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
        log(`Se ha cambiado el quiz ${colorize(quiz.id,'magetna')} por: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
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
//este mio parece que funciona
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
  /**
 * Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a probar.
 */
exports.testCmd = (rl, id) => {
  validateId(id)
  .then(id=>models.quiz.findById(id))
  .then(
    quiz=>{
    if(!quiz){throw new Error(`No existe un quiz asociado al id = ${id}.`);}
    return makeQuestion(rl,quiz)
     .then(a=>{
      if(a===quiz.answer.toLowerCase().trim()){
      biglog('Correcto','bgGreen');
    } else {biglog('Incorrecto','bgRed');}
  })
  .catch(error=>{errorlog(error.message);})
  .then(()=>{rl.prompt();});

});
};


/**
 * Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
 * Se gana si se contesta a todos satisfactoriamente.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.playCmd = rl => {
  let score =0;
  const resolved=[];

  let playnext=()=>{
    const whereOpt={'id':{[Sequelize.Op.notIn]:resolved}};
    return models.quiz.count({where:whereOpt})
    .then(function(count){
      return models.quiz.findOne({where:whereOpt});
      })
      .then(quiz=>{
        if(!quiz){
          log('No hay nada que preguntar');
          return;
        }
        resolved.push(quiz.id);
        return makeQuestion(rl, `${quiz.question}?`)
        .then(answer=>{
          if(answer.toLowerCase().trim()===quiz.answer.toLowerCase().trim()){
            score++;
            log(`CORRECTO - Lleva ${score} aciertos.`);
            return playnext();
          }else{log("INCORRECTO.");}
        });
      });
    };

    playnext()
    .then(()=>{
      log("Fin del juego. Aciertos:");
      biglog(score,'magenta');
    })
    .catch(error=>{errorlog(error.message)
    })
  .then(()=>{
    rl.prompt();
  });
};


/**
 * Muestra los nombres de los autores de la práctica.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.creditsCmd = rl => {
    log('Autores de la práctica:');
    log('Alicia Soria', 'green');
    rl.prompt();
};


/**
 * Terminar el programa.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.quitCmd = rl => {
    rl.close();
};
