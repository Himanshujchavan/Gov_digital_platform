const { Controller, All, Req, Res, Body, Param } = require('@nestjs/common');
const { ProxyService } = require('./proxy.service');

@Controller('api')
class GatewayController {
  constructor(proxyService) {
    this.proxyService = proxyService;
  }

  @All(':service/*')
  async handleRequest(@Req() req, @Res() res, @Param('service') service, @Param('0') path) {
    // Extract the remaining path after the service name
    const fullPath = req.url.replace(`/api/${service}`, '');
    
    try {
      const result = await this.proxyService.forward(
        service,
        fullPath,
        req.method,
        req.body,
        req.query,
        req.headers['authorization']
      );
      
      const status = result.status || 200;
      return res.status(status).json(result.data || result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Gateway Error: ${error.message}`
      });
    }
  }
}

module.exports = { GatewayController };
