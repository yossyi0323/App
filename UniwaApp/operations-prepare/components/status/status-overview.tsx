'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Item, InventoryStatus } from '@/lib/types';

interface StatusOverviewProps {
  date: string;
  items: Item[];
  inventoryStatuses: InventoryStatus[];
}

export function StatusOverview({ date, items, inventoryStatuses }: StatusOverviewProps) {
  const [showActionNeeded, setShowActionNeeded] = useState(true);
  
  const getItemStatus = (itemId: string) => {
    return inventoryStatuses.find(status => status.itemId === itemId);
  };

  const needsAction = (status: InventoryStatus | undefined) => {
    if (!status) return false;
    
    return (
      status.checkStatus === 'unchecked' ||
      status.restockStatus === 'needs-restock' ||
      status.createStatus === 'needs-creation' ||
      status.orderStatus === 'needs-order'
    );
  };

  const filteredItems = showActionNeeded
    ? items.filter(item => needsAction(getItemStatus(item.id)))
    : items;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'unchecked':
        return <Badge variant="outline">未確認</Badge>;
      case 'checking':
        return <Badge variant="secondary">確認中</Badge>;
      case 'checked':
        return <Badge className="bg-green-500">確認済</Badge>;
      case 'not-required':
        return <Badge variant="outline">不要</Badge>;
      case 'needs-restock':
        return <Badge variant="secondary">要補充</Badge>;
      case 'restocked':
        return <Badge className="bg-green-500">補充済</Badge>;
      case 'needs-creation':
        return <Badge variant="secondary">要作成</Badge>;
      case 'created':
        return <Badge className="bg-green-500">作成済</Badge>;
      case 'creation-requested':
        return <Badge className="bg-blue-500">作成依頼済</Badge>;
      case 'needs-order':
        return <Badge variant="secondary">要発注</Badge>;
      case 'ordered':
        return <Badge className="bg-green-500">発注依頼済</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">準備状況一覧</CardTitle>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-action-needed"
              checked={showActionNeeded}
              onCheckedChange={(checked) => setShowActionNeeded(!!checked)}
            />
            <Label 
              htmlFor="show-action-needed"
              className="text-sm cursor-pointer"
            >
              要対応のみ表示
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="check">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="check">確認</TabsTrigger>
            <TabsTrigger value="restock">補充</TabsTrigger>
            <TabsTrigger value="create">作成</TabsTrigger>
            <TabsTrigger value="order">発注</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[calc(100vh-300px)]">
            <TabsContent value="check" className="mt-0">
              {filteredItems.map(item => {
                const status = getItemStatus(item.id);
                return (
                  <div key={item.id} className="py-2 border-b">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.name}</span>
                      {status && renderStatusBadge(status.checkStatus)}
                    </div>
                    {status && (
                      <div className="text-sm text-muted-foreground mt-1">
                        在庫数: {status.currentStock || 0}
                      </div>
                    )}
                  </div>
                );
              })}
            </TabsContent>
            
            <TabsContent value="restock" className="mt-0">
              {filteredItems.map(item => {
                const status = getItemStatus(item.id);
                return (
                  <div key={item.id} className="py-2 border-b">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.name}</span>
                      {status && renderStatusBadge(status.restockStatus)}
                    </div>
                    {status && (
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-muted-foreground">
                          補充数: {status.restockAmount || 0}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </TabsContent>
            
            <TabsContent value="create" className="mt-0">
              {filteredItems.map(item => {
                const status = getItemStatus(item.id);
                return (
                  <div key={item.id} className="py-2 border-b">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.name}</span>
                      {status && renderStatusBadge(status.createStatus)}
                    </div>
                    {status && status.notes && (
                      <div className="text-sm text-muted-foreground mt-1 truncate">
                        {status.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </TabsContent>
            
            <TabsContent value="order" className="mt-0">
              {filteredItems.map(item => {
                const status = getItemStatus(item.id);
                return (
                  <div key={item.id} className="py-2 border-b">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.name}</span>
                      {status && renderStatusBadge(status.orderStatus)}
                    </div>
                    {status && status.notes && (
                      <div className="text-sm text-muted-foreground mt-1 truncate">
                        {status.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}