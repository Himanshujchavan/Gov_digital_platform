const { Controller, All, Req, Res, Body, Param, Dependencies } = require('@nestjs/common');
const { ProxyService } = require('./proxy.service');

@Controller('api')
@Dependencies(ProxyService)
class GatewayController {
  constructor(proxyService) {
    this.proxyService = proxyService;
  }

  @All([':service', ':service/*'])
  async handleRequest(@Req() req, @Res() res, @Param('service') service) {
    // Extract the remaining path after the service name without query string
    const urlWithoutQuery = req.url.split('?')[0];
    const fullPath = urlWithoutQuery.replace(new RegExp(`^/api/${service}`), '') || '/';
    
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
