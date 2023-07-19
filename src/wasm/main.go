package main

import (
	"fmt"
	"syscall/js"

	"github.com/Knetic/govaluate"
)

func convertValue(value js.Value) interface{} {
	switch value.Type() {
	case js.TypeString:
		return value.String()
	case js.TypeNumber:
		return value.Float()
	case js.TypeBoolean:
		return value.Bool()
	case js.TypeNull, js.TypeUndefined:
		return nil
	}
	return nil
}

func evaluateExpression(this js.Value, args []js.Value) interface{} {
	expressionArg := args[0].String()
	variableMapArg := args[1]

	expression, err := govaluate.NewEvaluableExpression(expressionArg)
	if err != nil {
		// fmt.Printf("Failed to parse expression: %s\n", err)
		return fmt.Errorf("failed to parse expression: %v", err)
	}

	dataMap := make(map[string]interface{})
	keys := js.Global().Get("Object").Call("keys", variableMapArg)
	length := keys.Length()
	for i := 0; i < length; i++ {
		key := keys.Index(i).String()
		value := variableMapArg.Get(key)
		dataMap[key] = convertValue(value)
	}

	result, err := expression.Evaluate(dataMap)
	if err != nil {
		return fmt.Errorf("failed to evaluate expression: %v", err)
	}

	return result
}

func getVariables(this js.Value, args []js.Value) interface{} {
	expressionArg := args[0].String()

	expression, err := govaluate.NewEvaluableExpression(expressionArg)
	if err != nil {
		// fmt.Printf("Failed to parse expression: %s\n", err)
		return fmt.Errorf("failed to parse expression: %v", err)
	}

	variables := expression.Vars()
	variablesArray := make([]interface{}, len(variables))
	for i, variable := range variables {
		variablesArray[i] = variable
	}
	return js.ValueOf(variablesArray)
}

func registerFunctions() {
	js.Global().Set("evaluateExpression", js.FuncOf(evaluateExpression))
	js.Global().Set("getVariables", js.FuncOf(getVariables))
}

func main() {
	c := make(chan struct{}, 0)

	registerFunctions()

	<-c
}
