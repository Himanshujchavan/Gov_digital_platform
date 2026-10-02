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
    const urlWithoutQuery = req.url.split('?')[0];
    // Preserve the service prefix for upstream controllers, e.g. /api/auth/login -> /auth/login.
    let fullPath = urlWithoutQuery.replace(/^\/api(\/|$)/, '/') || '/';

    // Ensure it starts with / and no double slashes
    fullPath = fullPath.replace(/\/+/g, '/');
    if (!fullPath.startsWith('/')) {
      fullPath = '/' + fullPath;
    }

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
      return res.status(500).json(
        ApiResponse.error(`Gateway Error: ${error.message}`, 500)
      );
    }
  }
}

module.exports = { GatewayController };
