import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

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
  console.log(`Server running on http://localhost:${port}`)
  console.log(`Swagger docs: http://localhost:${port}/docs`)
}
bootstrap()
