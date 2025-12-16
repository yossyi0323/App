//go:build js && wasm
// +build js,wasm

package main

import (
	"syscall/js"
)

func main() {
	// DOM要素を取得
	document := js.Global().Get("document")
	app := document.Call("getElementById", "app")

	// タイトルを作成
	title := document.Call("createElement", "h1")
	title.Set("textContent", "Go WebAssembly Demo")
	app.Call("appendChild", title)

	// 入力フィールドを作成
	input := document.Call("createElement", "input")
	input.Set("type", "text")
	input.Set("placeholder", "何か入力してください...")
	input.Set("style", "padding: 10px; font-size: 16px; width: 300px;")
	app.Call("appendChild", input)

	// ボタンを作成
	button := document.Call("createElement", "button")
	button.Set("textContent", "クリック")
	button.Set("style", "padding: 10px 20px; font-size: 16px; margin-left: 10px; cursor: pointer;")
	app.Call("appendChild", button)

	// 結果表示エリアを作成
	result := document.Call("createElement", "div")
	result.Set("style", "margin-top: 20px; padding: 10px; border: 1px solid #ccc; min-height: 100px;")
	result.Set("textContent", "ここに結果が表示されます")
	app.Call("appendChild", result)

	// カウンター
	counter := 0

	// ボタンクリック時の処理
	buttonCallback := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		counter++
		inputValue := input.Get("value").String()

		if inputValue == "" {
			result.Set("textContent", "入力が空です！")
		} else {
			message := "入力された内容: \"" + inputValue + "\"\nクリック回数: " + js.ValueOf(counter).String()
			result.Set("textContent", message)
		}

		return nil
	})
	button.Call("addEventListener", "click", buttonCallback)

	// 入力フィールドのEnterキー処理
	inputCallback := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if args[0].Get("key").String() == "Enter" {
			button.Call("click")
		}
		return nil
	})
	input.Call("addEventListener", "keydown", inputCallback)

	// Goのログ出力（ブラウザのコンソールに表示）
	js.Global().Get("console").Call("log", "Go WebAssembly initialized!")

	// プログラムを保持（終了しないように）
	select {}
}
