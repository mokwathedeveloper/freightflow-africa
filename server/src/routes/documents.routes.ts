import { Router } from 'express';
import { uploadDocument, listDocuments } from '../controllers/documents.controller';

export const documentsRouter = Router();

documentsRouter.post('/', uploadDocument);
documentsRouter.get('/', listDocuments);
