'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface Component {
  inputType: 'PRODUCT' | 'TEXT_INPUT';
  productId?: string;
  ingredientName?: string;
  quantityMemo?: string;
  isOptional?: boolean;
}

interface Output {
  productId: string;
  quantityMemo?: string;
  isMainOutput?: boolean;
}

interface Product {
  id: string;
  name: string;
  type: string;
}

interface RecipeFormProps {
  initialData?: {
    recipeId: string;
    name: string;
    recipeUrl?: string;
    instructionsText: string;
    components: Component[];
    outputs: Output[];
  };
}

export function RecipeForm({ initialData }: RecipeFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || '');
  const [recipeUrl, setRecipeUrl] = useState(initialData?.recipeUrl || '');
  const [instructionsText, setInstructionsText] = useState(initialData?.instructionsText || '');
  const [components, setComponents] = useState<Component[]>(
    initialData?.components || [{ inputType: 'TEXT_INPUT', ingredientName: '', isOptional: false }]
  );
  const [outputs, setOutputs] = useState<Output[]>(
    initialData?.outputs || [{ productId: '', isMainOutput: true }]
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addComponent = () => {
    setComponents([...components, { inputType: 'TEXT_INPUT', ingredientName: '', isOptional: false }]);
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const updateComponent = (index: number, field: keyof Component, value: any) => {
    const updated = [...components];
    updated[index] = { ...updated[index], [field]: value };
    setComponents(updated);
  };

  const addOutput = () => {
    setOutputs([...outputs, { productId: '', isMainOutput: false }]);
  };

  const removeOutput = (index: number) => {
    setOutputs(outputs.filter((_, i) => i !== index));
  };

  const updateOutput = (index: number, field: keyof Output, value: any) => {
    const updated = [...outputs];
    updated[index] = { ...updated[index], [field]: value };
    setOutputs(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = initialData ? `/api/recipes/${initialData.recipeId}` : '/api/recipes';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          recipeUrl: recipeUrl || undefined,
          instructionsText,
          components: components.map(c => ({
            inputType: c.inputType,
            productId: c.inputType === 'PRODUCT' ? c.productId : undefined,
            ingredientName: c.inputType === 'TEXT_INPUT' ? c.ingredientName : undefined,
            quantityMemo: c.quantityMemo || undefined,
            isOptional: c.isOptional || false,
          })),
          outputs: outputs.map(o => ({
            productId: o.productId,
            quantityMemo: o.quantityMemo || undefined,
            isMainOutput: o.isMainOutput !== false,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '保存に失敗しました');
      }

      toast.success(initialData ? 'レシピを更新しました' : 'レシピを登録しました');
      router.push('/recipes');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">レシピ名 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="recipeUrl">YouTube URL</Label>
            <Input
              id="recipeUrl"
              type="url"
              value={recipeUrl}
              onChange={(e) => setRecipeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>材料 *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {components.map((component, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <Label>材料 {index + 1}</Label>
                {components.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeComponent(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div>
                <Label>入力方法 *</Label>
                <Select
                  value={component.inputType}
                  onValueChange={(value: 'PRODUCT' | 'TEXT_INPUT') =>
                    updateComponent(index, 'inputType', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRODUCT">ストックから選択</SelectItem>
                    <SelectItem value="TEXT_INPUT">テキスト入力</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {component.inputType === 'PRODUCT' ? (
                <div>
                  <Label>製品 *</Label>
                  <Select
                    value={component.productId || ''}
                    onValueChange={(value) => updateComponent(index, 'productId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="製品を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <Label>材料名 *</Label>
                  <Input
                    value={component.ingredientName || ''}
                    onChange={(e) => updateComponent(index, 'ingredientName', e.target.value)}
                    placeholder="例: にんにく、しょうが"
                    required
                  />
                </div>
              )}
              <div>
                <Label>量・単位</Label>
                <Input
                  value={component.quantityMemo || ''}
                  onChange={(e) => updateComponent(index, 'quantityMemo', e.target.value)}
                  placeholder="例: 2食分、適量"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`optional-${index}`}
                  checked={component.isOptional || false}
                  onChange={(e) => updateComponent(index, 'isOptional', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor={`optional-${index}`} className="font-normal">
                  オプション材料
                </Label>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addComponent}>
            材料を追加
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>手順 *</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={instructionsText}
            onChange={(e) => setInstructionsText(e.target.value)}
            placeholder="1. 材料を切る&#10;2. フライパンで炒める&#10;3. 味付けする"
            rows={10}
            required
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>アウトプット *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {outputs.map((output, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <Label>アウトプット {index + 1}</Label>
                {outputs.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOutput(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div>
                <Label>製品 *</Label>
                <Select
                  value={output.productId}
                  onValueChange={(value) => updateOutput(index, 'productId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="製品を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>量・単位</Label>
                <Input
                  value={output.quantityMemo || ''}
                  onChange={(e) => updateOutput(index, 'quantityMemo', e.target.value)}
                  placeholder="例: 2食分"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`main-${index}`}
                  checked={output.isMainOutput !== false}
                  onChange={(e) => updateOutput(index, 'isMainOutput', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor={`main-${index}`} className="font-normal">
                  主なアウトプット
                </Label>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addOutput}>
            アウトプットを追加
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          キャンセル
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? '保存中...' : initialData ? '更新' : '登録'}
        </Button>
      </div>
    </form>
  );
}
