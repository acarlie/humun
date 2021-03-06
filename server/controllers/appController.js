/* eslint-disable handle-callback-err */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const charities = require('./../controllers/charities');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { User } = require('../models');

// Defining methods for the appController
module.exports = {
  register: function (req, res) {
    const { firstName, lastName, email, password, password2 } = req.body;
    const errors = [];

    if (!firstName) {
      errors.push({ firstName: 'Please enter your first name.' });
    }
    if (!lastName) {
      errors.push({ lastName: 'Please enter your last name.' });
    }
    if (!email) {
      errors.push({ email: 'Please enter a valid email.' });
    }
    if (!password) {
      errors.push({ password: 'Password cannot be empty.' });
    }
    if (password !== password2) {
      errors.push({ password2: 'Passwords do not match' });
    }
    if (password.length < 6) {
      errors.push({ password: 'Password must be at least 6 characters' });
    }
    if (errors.length > 0) {
      res.send({
        success: false,
        errors
      });
    } else {
      User.findOne({ email: email }).then(user => {
        if (user) {
          errors.push({ email: 'Email already exists' });
          res.send({
            success: false,
            errors
          });
        } else {
          const newUser = new User({
            firstName,
            lastName,
            email,
            password
          });

          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then(user => {
                  user.password = undefined;
                  res.send({ success: true, user });
                })
                .catch(err => res.status(422).json(err));
            });
          });
        }
      });
    }
  },
  login: function (req, res) {
    console.log(req);
    const email = req.body.email;
    const password = req.body.password;
    const errors = [];
    User.findOne({
      email: email
    }).then(user => {
      if (!user) {
        errors.push({ email: 'Email not registered' });
        return res.json({ success: false, errors });
      }

      // Match password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          console.log(process.env.secret);
          console.log(user);
          const token = jwt.sign({ email: user.email, _id: user._id }, process.env.secret, {
            expiresIn: 604800
          });
          res.json({
            success: true,
            token: 'JWT ' + token,
            user: {
              id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              causesSetUp: user.causesSetUp
            }
          });
        } else {
          errors.push({ password: 'Incorrect password' });
          return res.json({ success: false, errors });
        }
      });
    });
  },
  findUserData: function (req, res) {
    User.findById(req.user._id)
      .then(user => {
        user.password = undefined;
        res.json({ success: true, user });
      })
      .catch(err => res.status(422).json(err));
  },
  saveUserData: function (req, res) {
    User.findOneAndUpdate({ _id: req.user._id }, { $set: req.body }, { new: true })
      .then(user => {
        user.password = undefined;
        res.json({ success: true, user });
      })
      .catch(err => res.status(422).json(err));
  },
  saveTransaction: function (req, res) {
    User.findOneAndUpdate({ _id: req.user._id }, { $set: req.body }, { new: true })
      .then(user => {
        user.password = undefined;
        res.json({ success: true, user });
      })
      .catch(err => res.status(422).json(err));
  },
  allocationCalc: function (req, res) {
    const selectedCharity = req.user.userSelectedInfo;
    const profileData = req.user.profileData;
    const selectedPortion = selectedCharity.portion;
    const curTransactions = req.user.transactions;
    const curAllocations = Object.values(req.user.allocations);
    console.log('==================');
    console.log('input', profileData);
    const userArray = Object.values(profileData);
    // .map(i => profileData[i]);
    const profileArray = Object.keys(profileData);
    // .map(i => profileData[i]);
    console.log('userArray: ' + userArray);
    console.log('profileArray: ' + profileArray);
    const SvERatio = profileData.socialVenvironmental / 6;
    const portions = [];
    const allocationsTemp = [];
    const allocationsObj = {};
    const newTransactions = [];
    for (let i = 4; i < userArray.length; i++) {
      if (i < 7) {
        portions.push(userArray[i] * SvERatio);
      } else {
        portions.push(userArray[i] * (1 - SvERatio));
      }
    }
    if (selectedPortion !== 0) {
      allocationsTemp.push({
        name: selectedCharity.charityName,
        link: selectedCharity.charityLink,
        ein: selectedCharity.ein,
        description: selectedCharity.charityTagLine,
        portion: selectedCharity.portion,
        city: selectedCharity.charityCity,
        state: selectedCharity.charityState,
        category: 'userSelected'
      });
    }
    charities.charities.forEach(element => {
      const tempDiff = Math.abs(element.localVglobal - userArray[1]) + Math.abs(element.shortVlong - userArray[2]);
      if (allocationsTemp.filter(e => e.category === element.category).length === 0) {
        allocationsTemp.push({
          name: element.name,
          link: element.link,
          ein: element.ein,
          description: element.description,
          city: element.city,
          state: element.state,
          category: element.category,
          diff: tempDiff
        });
      }
      if (allocationsTemp.some(e => e.category === element.category && e.diff > tempDiff)) {
        for (let i = 0; i < allocationsTemp.length; i++) {
          if (allocationsTemp[i].category === element.category) {
            allocationsTemp[i].name = element.name;
            allocationsTemp[i].link = element.link;
            allocationsTemp[i].ein = element.ein;
            allocationsTemp[i].description = element.description;
            allocationsTemp[i].city = element.city;
            allocationsTemp[i].state = element.state;
            allocationsTemp[i].diff = tempDiff;
            break;
          }
        }
      }
      // console.log('allocationsTemp: ', allocationsTemp);
      allocationsTemp.forEach(element => {
        switch (element.category) {
          case 'pollution':
            element.portion = portions[0] * (100 - selectedPortion) / 100;
            allocationsObj.pollution = element;
            break;
          case 'habitat':
            element.portion = portions[1] * (100 - selectedPortion) / 100;
            allocationsObj.habitat = element;
            break;
          case 'climateChange':
            element.portion = portions[2] * (100 - selectedPortion) / 100;
            allocationsObj.climateChange = element;
            break;
          case 'basicNeeds':
            element.portion = portions[3] * (100 - selectedPortion) / 100;
            allocationsObj.basicNeeds = element;
            break;
          case 'education':
            element.portion = portions[4] * (100 - selectedPortion) / 100;
            allocationsObj.education = element;
            break;
          case 'globalHealth':
            element.portion = portions[5] * (100 - selectedPortion) / 100;
            allocationsObj.globalHealth = element;
            break;
          case 'userSelected':
            allocationsObj.userSelected = element;
            break;
          default: console.log('Invalid portion operation');
        }
      });
    });
    for (let i = 0; i < curTransactions.length; i++) {
      const transaction = curTransactions[i];
      const donation = curTransactions[i].donation;
      console.log('testy: ', !curTransactions[i].allocations);
      if (!curTransactions[i].allocations) {
        transaction.allocations = [];
        curAllocations.forEach(element => {
          // console.log('elementfull: ', element);
          if (element.portion) {
            const amountPaid = (element.portion / 100 * donation).toFixed(2);
            // console.log('amnt paid: ' + amountPaid);
            transaction.allocations.push(
              {
                name: element.name,
                ein: element.ein,
                amount: amountPaid
              }
            );
          }
        });
      }
      newTransactions.push(transaction);
    }
    console.log('curTransactions: ', curTransactions);
    console.log('curAllocations: ', curAllocations);
    console.log('newTransactions: ', JSON.stringify(newTransactions));
    // console.log('allocationsObj: ', allocationsObj);
    // console.log('userArray[1]: ' + userArray[1]);
    // console.log('user: ' + req.user._id);
    // console.log('profileData: ' + profileData);
    User.findOneAndUpdate(
      { _id: req.user._id },
      { $set:
            {
              profileData: profileData,
              allocations: allocationsObj,
              transactions: newTransactions
            }
      },
      { new: true }
    )
      .then(user => {
        user.password = undefined;
        res.json({ success: true, user });
      })
      .catch(err => res.status(422).json(err));
  },
  resetPW: function (req, res) {
    const errors = [];
    const decoded = jwt.decode(req.body.token);
    if (!decoded) {
      errors.push({ token: 'Password reset token has expired or is invalid.' });
      return res.json({ success: false, errors });
    }
    User.findOne({ email: decoded.email })
      .then(user => {
        const { password, password2, token } = req.body;
        if (!user || (token !== user.pwResetToken)) {
          errors.push({ token: 'Password reset token has expired or is invalid. <a href="/reset">Send Reset Email</a>' });
          return res.json({ success: false, errors });
        }
        if (!password) {
          errors.push({ password: 'Password cannot be empty.' });
        }
        if (password !== password2) {
          errors.push({ password2: 'Passwords do not match' });
        }
        if (password.length < 6) {
          errors.push({ password: 'Password must be at least 6 characters' });
        }
        if (errors.length > 0) {
          return res.json({ success: false, errors });
        } else {
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
              if (err) throw err;
              User.findOneAndUpdate({ email: decoded.email }, { password: hash, pwResetToken: null })
                .then(user => {
                  res.json({ success: true });
                });
            });
          });
        }
      });
  },
  getPwResetToken: function (req, res) {
    const production = 'https://humun.herokuapp.com/reset/';
    const development = 'http://localhost:3000/reset/';
    const url = (process.env.NODE_ENV ? production : development);
    const token = jwt.sign(req.body, process.env.pwResetSecret, {
      expiresIn: 3600
    });
    User.findOneAndUpdate(req.body, { $set: { pwResetToken: token } }, { new: true })
      .then(user => {
        // async..await is not allowed in global scope, must use a wrapper
        async function main () {
          // create reusable transporter object using the default SMTP transport
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.humunEmail, // generated ethereal user
              pass: process.env.humunPassword // generated ethereal password
            }
          });

          // send mail with defined transport object
          // eslint-disable-next-line no-unused-vars
          const info = await transporter.sendMail({
            from: process.env.humunEmail, // sender address
            to: req.body.email, // list of receivers
            subject: 'Humun Password Reset', // Subject line
            html: `<p>Hi ${user.firstName},</p><p>Someone, probably you, is having trouble logging in to Humun and has requested help.</p><p>To reset your password, please use this link: ${url}${user.pwResetToken}</p><p>Thanks,</p><p>The Humun Team</p>` // html body
          });
        }
        if (user) {
          main().catch(console.error).then(res.json({ success: true }));
        } else {
          const errors = [];
          errors.push({ email: 'Email not found' });
          return res.json({ success: false, errors });
        }
      })
      .catch(err => res.status(422).json(err));
  },
  getEmailToken: function (req, res) {
    const production = 'https://humun.herokuapp.com/emailConfirm/';
    const development = 'http://localhost:3000/emailConfirm/';
    const url = (process.env.NODE_ENV ? production : development);
    const token = jwt.sign(req.body, process.env.pwResetSecret, {
      expiresIn: 3600
    });
    User.findOneAndUpdate(req.body, { $set: { emailToken: token } }, { new: true })
      .then(user => {
        // async..await is not allowed in global scope, must use a wrapper
        async function main () {
          // create reusable transporter object using the default SMTP transport
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.humunEmail, // generated ethereal user
              pass: process.env.humunPassword // generated ethereal password
            }
          });

          // send mail with defined transport object
          // eslint-disable-next-line no-unused-vars
          const info = await transporter.sendMail({
            from: process.env.humunEmail, // sender address
            to: req.body.email, // list of receivers
            subject: 'Humun Email Confirmation', // Subject line
            html: `<p>Hi ${user.firstName},</p><p>It looks like you have not verified your email yet.</p><p>To confirm your email, please use this link: ${url}${user.emailToken}</p><p>Thanks,</p><p>The Humun Team</p>` // html body
          });
        }
        if (user) {
          main().catch(console.error).then(res.json({ success: true }));
        } else {
          const errors = [];
          errors.push({ email: 'Account not found.' });
          return res.json({ success: false, errors });
        }
      })
      .catch(err => res.status(422).json(err));
  },
  confirmEmail: function (req, res) {
    const errors = [];
    const decoded = jwt.decode(req.body.token);
    if (!decoded) {
      errors.push({ token: 'Email confirmation token has expired or is invalid.' });
      return res.json({ success: false, errors });
    }
    User.findOne({ email: decoded.email })
      .then(user => {
        const { token } = req.body;
        if (!user || (token !== user.emailToken)) {
          errors.push({ token: 'Email confimration token has expired or is invalid.' });
          return res.json({ success: false, errors });
        }
        User.findOneAndUpdate({ email: decoded.email }, { emailSetUp: true, emailToken: null })
          .then(user => {
            res.json({ success: true });
          });
      });
  }
};
