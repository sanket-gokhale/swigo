import { Property } from '../types/property';

let properties: Property[] = [];
export function setProperties(items: Property[]) { properties = items; }
export function getProperties() { return properties; }
