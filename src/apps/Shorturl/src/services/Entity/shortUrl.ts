// import cryptoRandomString from 'crypto-random-string';
import {
  Dependencies,
  injectDependencies,
} from '../../../../util/dependencyInjector';
import shortUrlEntityGateway from '../DBGateway/shortUrl';
import { Cache } from "cache-manager";
function generateRandomString(n) {
  let randomString           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for ( let i = 0; i < n; i++ ) {
    randomString += characters.charAt(Math.floor(Math.random()*characters.length));
 }
 return randomString;
}


class ShortUrl {
  static async resolve(
    cacheManager:Cache,
    shortComponent: string,
    dependencies: Dependencies = null,
  ): Promise<string> {
    dependencies = injectDependencies(dependencies, ['db']);
  

    const longUrl = await shortUrlEntityGateway.resolveShortUrl(
      cacheManager,
      shortComponent,
      dependencies,
    );
    return longUrl && longUrl.longComponent;
  }

  static async create(
    cacheManager:Cache,
    longComponent: string,
    expirationDate: Date = null,
    dependencies: Dependencies = null,
  ): Promise<string> {
    dependencies = injectDependencies(dependencies, ['db', 'config']);
    // const shortComponent = cryptoRandomString({
    //   length: dependencies.config.shortUrlComponentLength,
    //   type: 'alphanumeric',
    // });
    const shortComponent = generateRandomString(dependencies.config.shortUrlComponentLength)
    console.log(shortComponent)
    await shortUrlEntityGateway.create(
      cacheManager,
      shortComponent,
      longComponent,
      expirationDate,
      dependencies,
    );
    return shortComponent;
  }
}

export default ShortUrl;
