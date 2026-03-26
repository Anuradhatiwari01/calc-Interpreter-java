package main.java.calc.environment;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public class Environment {
    private final Map<String, Object> variables;

    public Environment(){
        this.variables = new HashMap<>();
    }
    public void set(String name, Object value) {
        variables.put(name, value);
    }
    public Optional<Object> get(String name) {
        return Optional.ofNullable(variables.get(name));
    }
    public Object getOrThrow(String name) {
        return get(name).orElseThrow(() ->
                new RuntimeException("Variable not defined: " + name)
        );
    }
}
