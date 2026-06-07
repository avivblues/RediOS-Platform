import { Module } from '@nestjs/common';
import { ContextModule } from '../core/context/context.module';
import { FormModule as CoreFormModule } from '../core/form/form.module';
import { FormsController } from './forms.controller';

@Module({
  imports: [ContextModule, CoreFormModule],
  controllers: [FormsController],
})
export class FormsModule {}
