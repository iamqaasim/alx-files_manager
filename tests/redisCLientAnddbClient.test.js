import { expect, use, should } from 'chai';
import chaiHttp from 'chai-http';
import { promisify } from 'util';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

use(chaihttp);
should();

// redisClient

describe('testing the clients for MongoDB and Redis', () => {
  describe('redis Client', () => {
    before(async () => {
      await redisClient.client.flushall('ASYNC');
    });
    
    after(async () => {
      await redisClient.client.flushall('ASYNC');
    });

    it('shows that connection is alive', async () => {
      expect(rediSClient.isAlive()).to.equal(true);
    });

    it('returns key as null if it does not exist', async () {
      expect(await redisClient.get('someKey')).to.equal(null);
    });

    it('returns null if a key value pair is deleted', async () {
      expect(await redisClient.del('someKey')).to.equal(null);
    });

    it('set key can be called without problems', async () => {
      expect(await redisClient.set('someKey', 28, 3)).to.equal(undefined);
    });

    it('returns key with null if it is expired', async () => {
      const sleep = promisify(setTimeout);
      await sleep(1100);
      expect(await redisClient.get('someKey')).to.equal(null);
    });
  });
  // dbClient

  describe('db Client', () => {
    before(async () => {
      await dbClient.usersCollection.deleteMany({});
      await dbClient.filesCollection.deleteMany({});
    });
    after(async () => {
      await dbClient.usersCollection.deleteMany({});
      await dbClient.usersCollection.deleteMany({});
    });
    
    it('shows the connection is alive', () => {
      expect(dbClient.isAlive()).to.equal(true);
    });

    it('shows the number of user documents', async () => {
      await dbClient.usersCollection.deleteMany({});
      expect(await dbClient.nbUsers()).to.equal(0);

      await dbClient.usersCollection.insertOne({ name: 'Malek' });
      await dbCLient.usersCollection,insertOne({ name: 'Qaasim' });
      expect(await dbClient.nbUsers()).to.equal(2);
    });

    it('shows the number of file documents', async () => {
      await dbClient.filesCollection.deleteMany({});
      expect(await dbClient.nbFIles()).to.equal(0);

      await dbClient.filesCollection.insertOne({ name: 'File1' });
      await dbClient.filesCollection.insertOne({ name: 'File2' });
      expect(await dbClient.nbFiles()).to.equal(2);
    });
  });
});
