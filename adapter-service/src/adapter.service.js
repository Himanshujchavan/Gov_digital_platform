const { Injectable, BadRequestException } = require('@nestjs/common');
const { RevenueAdapter } = require('./adapters/revenue.adapter');
const { WelfareAdapter } = require('./adapters/welfare.adapter');
const { LandAdapter } = require('./adapters/land.adapter');

@Injectable()
class AdapterService {
  constructor() {
    this.adapters = {
      revenue: new RevenueAdapter(),
      welfare: new WelfareAdapter(),
      land: new LandAdapter(),
    };
  }

  transform(department, data) {
    const adapter = this.getAdapter(department);
    return adapter.transform(data);
  }

  reverseTransform(department, data) {
    const adapter = this.getAdapter(department);
    return adapter.reverseTransform(data);
  }

  getSchema(department) {
    const adapter = this.getAdapter(department);
    return adapter.getSchema();
  }

  getAdapter(department) {
    const adapter = this.adapters[department.toLowerCase()];
    if (!adapter) {
      throw new BadRequestException(`No adapter found for department: ${department}`);
    }
    return adapter;
  }
}

module.exports = { AdapterService };
