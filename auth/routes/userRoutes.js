import express from "express"

import {  validateUpdateUser ,validateGetUser } from '../validators/user.js'
import { getUsers, getUser, createUser, deleteUser, updateUser } from "../controllers/userControler.js";
import { apiAuth } from '../middleware/apiauth.js'

const router = express.Router()

router.get('/', apiAuth, getUsers)
router.get('/:id', validateGetUser, apiAuth,getUser)
// router.post('/create', validateCreateUser, apiAuth, createUser)
router.put('/:id', validateUpdateUser, validateGetUser,apiAuth, updateUser)
router.delete('/delete/:id', apiAuth, deleteUser)

export default router

