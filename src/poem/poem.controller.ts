import { Controller } from '@nestjs/common';
import { PoemService } from './poem.service';

@Controller('poem')
export class PoemController {
  constructor(private readonly poemService: PoemService) {}
}
