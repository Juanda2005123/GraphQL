import { Property } from './property.model';
import { User } from '../users/user.model';

describe('Property Model', () => {
  it('should create a property instance', () => {
    const property = new Property();
    expect(property).toBeDefined();
  });

  it('should accept valid property properties', () => {
    const property = new Property();
    property.id = 'prop-id';
    property.title = 'Test Property';
    property.description = 'A nice property';
    property.price = 100000;
    property.location = 'Test City';
    property.bedrooms = 3;
    property.bathrooms = 2;
    property.area = 120;
    property.imageUrls = ['url1', 'url2'];
    property.isDeleted = false;

    expect(property.id).toBe('prop-id');
    expect(property.title).toBe('Test Property');
    expect(property.price).toBe(100000);
    expect(property.bedrooms).toBe(3);
    expect(property.imageUrls).toEqual(['url1', 'url2']);
  });

  it('should have relationship with User (owner)', () => {
    const property = new Property();
    const user = new User();
    user.id = 'user-id';
    property.owner = user;

    expect(property.owner).toBeDefined();
    expect(property.owner.id).toBe('user-id');
  });

  it('should have default isDeleted as false', () => {
    const property = new Property();
    expect(property.isDeleted).toBeFalsy();
  });

  it('should accept empty imageUrls array', () => {
    const property = new Property();
    property.imageUrls = [];
    expect(property.imageUrls).toEqual([]);
  });
});

