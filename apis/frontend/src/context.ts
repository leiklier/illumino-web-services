import { Request, Response } from 'express'
import { getTokenPayload, getAuthTypeByToken } from './lib/token'

export interface Context {
    req: Request,
    res: Response
    clientIp: string
}