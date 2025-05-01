import express from "express";
import { apiAuth } from "../../../auth/middleware/apiauth";
import { getLinea } from "./lineasController";

const router = express.Router()

router.get('/', apiAuth, getLinea)
router.get('/:codigo')