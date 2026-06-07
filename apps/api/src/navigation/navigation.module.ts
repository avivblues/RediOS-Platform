import { Module } from '@nestjs/common';
import { ContextModule } from '../core/context/context.module';
import { NavigationModule as CoreNavigationModule } from '../core/navigation/navigation.module';
import { NavigationController } from './navigation.controller';

@Module({
  imports: [ContextModule, CoreNavigationModule],
  controllers: [NavigationController],
})
export class NavigationModule {}
