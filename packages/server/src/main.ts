import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import * as bodyParser from 'body-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true })

  app.use(bodyParser.text({ type: 'text/xml' }))
  app.use(bodyParser.text({ type: 'application/xml' }))
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
  app.enableCors()

  const config = new DocumentBuilder()
    .setTitle('Woca API')
    .setDescription('视频去字幕平台接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config))

  const port = process.env.PORT ?? 3001
  await app.listen(port)
  console.log(`Server running on http://localhost:${port} (NODE_ENV=${process.env.NODE_ENV ?? 'undefined'})`)
  console.log(`Swagger docs: http://localhost:${port}/docs`)
}
bootstrap()
