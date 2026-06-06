import { Module } from '@nestjs/common';
import { SimulationModule as CoreSimulationModule } from '../core/simulation/simulation.module';
import { SimulationController } from './simulation.controller';

@Module({
  imports: [CoreSimulationModule],
  controllers: [SimulationController],
})
export class SimulationModule {}
