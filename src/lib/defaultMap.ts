export type DefaultValueFactory<V> = () => V;

export default class DefaultMap<K, V> extends Map<K, V> {
  constructor(public readonly defaultValueFactory: DefaultValueFactory<V>) {
    super();
  }

  public get(key: K): V {
    const value = super.get(key);

    if (value) {
      return value;
    }

    const defaultValue = this.defaultValueFactory();
    this.set(key, defaultValue);
    return defaultValue;
  }
}
