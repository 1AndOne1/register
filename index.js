const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const md5 = require('md5')
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

const jwt = require("jsonwebtoken");
const secretkey = 'tiltxdhaha'

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
open({
  filename: "./db/test.db",
  driver: sqlite3.Database
}).then((db) => {

  app.get('/people/register', async (req, res) => {
    const people = await db.all("SELECT * FROM People")
    res.json(people)
  })
  app.get('/people/login', async (req, res) => {
    const people = await db.all("SELECT * FROM People")
    res.json(people)
  })
  app.get('/profile/team', async (req, res) => {
    const people = await db.all("SELECT * FROM Team")
    res.json(people)
  })


  //.......regist......................
  const authMiddleWare = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token === null) {
      return res.status(401).json({message: 'tilt token'})
    }
    jwt.verify(token, secretkey, (err, decoded) => {
      if (err) {
        return res.status(403).json({message: 'Error with verify'})
      }
      req.userEmail = decoded.userEmail
      next()
    })
  }

  const generateToken = (email) => {
    return jwt.sign({ username: email.username }, secretkey, { expiresIn: '1h' })
  }

  app.post('/people/register', async (req, res) => {
    const user = {nickname, email, password} = req.body
    const token = jwt.sign({userEmail: user.email}, secretkey)
    // res.setHeader('Content-Type', 'application/json');
    const result = await db.all(`SELECT * FROM People WHERE email = "${email}"`)
    // console.log(result)
    if (result.length > 0) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    else {
      const userAdd = async (res) => {
        await db.run(`INSERT INTO People (nickname, email, password, token) VALUES ("${nickname}", "${email}", "${md5(password)}", "${token}")`, (err) => {
          if (err) {
            return res.status(500).json({ message: 'Ошибка при добавлении пользователя в базу данных' });
          }
          res.json({
            data: "responce"
          });
        }

        )
      }
      userAdd(res)
    }
    return res.json({ nickname, email, password, token });
  });
  //.......addTeam......................
  app.post('/profile/team',authMiddleWare, async (req, res) => {
    const row = { teamName, captain, game } = req.body;
    const resultTeamadder = await db.all(`SELECT * FROM Team WHERE teamName="${teamName}"`)
    // console.log(resultTeamadder)
    if (resultTeamadder.length > 0) {
      return res.status(400).json({ message: 'Такая Команда Существует' });
    }

    else {
      // console.log(teamName, captain, game)
      const teamAdd = async (res, req) => {
        await db.run(`INSERT INTO Team (teamName, captain, game ) VALUES ("${teamName}", "${captain}", "${game}")`, (err) => {
          if (err) {
            return res.status(500).json({ message: 'Ошибка при добавлении пользователя в базу данных' });
          }
          res.json({
            data: "responce"
          });
        }

        )
      }
      teamAdd()
    }
    return res.json({ teamName, captain, game });

  });
  //.............................
  app.post('/login', (req, res) => {
    const user = {id: 1, username:'churka'}
    const token = jwt.sign({userID: user.id}, secretkey)
    res.json({token})
  })
  //...........login..................


  app.post('/people/login', async function (req, res) {
    const payload = {role: `user` }
    const token = generateToken(payload)
    const logData = { nickname, email, password } = req.body;
    const log = await db.all(`SELECT * FROM People WHERE email = "${email}"`)
    const pass = await db.all(`SELECT * FROM People WHERE email = "${password}"`)
    const nick = await db.all(`SELECT * FROM People WHERE email = "${nickname}"`)
    

    console.log(log.length)
    if ((log.length > 0)) {
      return res.json({ message: 'дОБРО ПОЖАЛОВАТЬ', token })
      

    }
    // console.log(logData.password, `${password}`, logData.email, `${email}`)
    if (pass.length === 0 || log.length === 0) {
      res.json({ message: "Не верная почта или пароль " })
    }
    else {
      res.json({ message: "Пройдите Регистрацию" })
    }
  });
 

  app.use((req, res, next) => {
    if (req.headers.authorization) {
      next()
    }
    return res.json({ message: 'kaif' })
  });
});
//.................................









app.listen(3000, () => {
  console.log("rabotaet" + 3000)
})





