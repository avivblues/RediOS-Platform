import { Body, Controller, Post } from '@nestjs/common';
import type { SimulationRequest, SimulationResult } from '@redios/shared';
import { SimulationEngine } from '../core/simulation/simulation-engine.service';

@Controller('simulation')
export class SimulationController {
  constructor(private readonly simulationEngine: SimulationEngine) {}

  @Post('run')
  run(@Body() request: SimulationRequest): Promise<SimulationResult> {
    return this.simulationEngine.simulate({
      ...request,
      traceMode: request.traceMode ?? 'RETURN_ONLY',
    });
  }
}
