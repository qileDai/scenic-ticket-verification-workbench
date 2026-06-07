import { beforeEach, describe, expect, it } from 'vitest'
import { LocalStorageService } from '../src/services/storage'

interface TestEntity {
  id: string
  name: string
  description?: string
  value?: number
  index?: number
}

describe('本地存储服务', () => {
  let storage: LocalStorageService

  beforeEach(() => {
    storage = new LocalStorageService()
    localStorage.clear()
  })

  describe('基本CRUD操作', () => {
    it('应该能够创建和读取数据', async () => {
      const testData: TestEntity = { id: '1', name: '测试数据' }

      await storage.create<TestEntity>('test', testData)
      const result = await storage.getAll<TestEntity>('test')

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(testData)
    })

    it('应该能够通过ID获取单条数据', async () => {
      const testData: TestEntity = { id: '2', name: '数据2' }

      await storage.create<TestEntity>('test', testData)
      const result = await storage.getById<TestEntity>('test', '2')

      expect(result).toEqual(testData)
    })

    it('获取不存在的ID应该返回null', async () => {
      const result = await storage.getById<TestEntity>('test', 'nonexistent')
      expect(result).toBeNull()
    })

    it('应该能够更新数据', async () => {
      const originalData: TestEntity = { id: '3', name: '原始名称' }
      await storage.create<TestEntity>('test', originalData)

      const updatedData = await storage.update<TestEntity>('test', '3', { name: '更新后名称' })

      expect(updatedData?.name).toBe('更新后名称')

      const result = await storage.getById<TestEntity>('test', '3')
      expect(result?.name).toBe('更新后名称')
    })

    it('更新不存在的ID应该返回null', async () => {
      const result = await storage.update<TestEntity>('test', 'nonexistent', { name: '测试' })
      expect(result).toBeNull()
    })

    it('应该能够删除数据', async () => {
      const testData: TestEntity = { id: '4', name: '待删除' }
      await storage.create<TestEntity>('test', testData)

      const deleteResult = await storage.delete('test', '4')
      expect(deleteResult).toBe(true)

      const result = await storage.getById<TestEntity>('test', '4')
      expect(result).toBeNull()
    })

    it('删除不存在的ID应该返回false', async () => {
      const result = await storage.delete('test', 'nonexistent')
      expect(result).toBe(false)
    })
  })

  describe('批量操作', () => {
    it('应该能够批量创建数据', async () => {
      const items: TestEntity[] = [
        { id: '5', name: '批量1' },
        { id: '6', name: '批量2' },
        { id: '7', name: '批量3' }
      ]

      await storage.batchCreate<TestEntity>('batch_test', items)
      const result = await storage.getAll<TestEntity>('batch_test')

      expect(result).toHaveLength(3)
    })

    it('应该能够批量更新数据', async () => {
      await storage.batchCreate<TestEntity>('batch_update', [
        { id: '8', name: '原1' },
        { id: '9', name: '原2' }
      ])

      const updates: Array<{ id: string; data: Partial<TestEntity> }> = [
        { id: '8', data: { name: '新1' } },
        { id: '9', data: { name: '新2' } }
      ]

      const updatedItems = await storage.batchUpdate<TestEntity>('batch_update', updates)

      expect(updatedItems).toHaveLength(2)
      expect(updatedItems[0].name).toBe('新1')
      expect(updatedItems[1].name).toBe('新2')
    })

    it('应该能够批量删除数据', async () => {
      await storage.batchCreate<TestEntity>('batch_delete', [
        { id: '10', name: '删除1' },
        { id: '11', name: '删除2' },
        { id: '12', name: '保留' }
      ])

      const deleteResult = await storage.batchDelete('batch_delete', ['10', '11'])
      expect(deleteResult).toBe(true)

      const remaining = await storage.getAll<TestEntity>('batch_delete')
      expect(remaining).toHaveLength(1)
      expect(remaining[0].id).toBe('12')
    })
  })

  describe('数据管理操作', () => {
    it('应该能够清空单个实体的所有数据', async () => {
      await storage.batchCreate<TestEntity>('clear_test', [
        { id: '13', name: '清空1' },
        { id: '14', name: '清空2' }
      ])

      await storage.clearAll('clear_test')
      const result = await storage.getAll<TestEntity>('clear_test')

      expect(result).toHaveLength(0)
    })

    it('应该能够检查是否有数据存在', async () => {
      expect(storage.hasData()).toBe(false)

      await storage.create<TestEntity>('check_test', { id: '15', name: '有数据了' })
      expect(storage.hasData()).toBe(true)
    })

    it('导出和导入数据应该保持一致性', async () => {
      const originalData: TestEntity[] = [
        { id: '16', name: '导出1', value: 100 },
        { id: '17', name: '导出2', value: 200 }
      ]

      await storage.batchCreate<TestEntity>('export_import', originalData)

      const exported = storage.exportAllData()
      expect(exported.export_import).toBeDefined()
      expect(exported.export_import).toHaveLength(2)

      localStorage.clear()
      expect(storage.hasData()).toBe(false)

      storage.importData(exported)
      expect(storage.hasData()).toBe(true)

      const imported = await storage.getAll<TestEntity>('export_import')
      expect(imported).toHaveLength(2)
      expect(imported[0]).toEqual(originalData[0])
    })

    it('重置所有数据应该清除所有存储的内容', async () => {
      await storage.batchCreate<TestEntity>('reset1', [{ id: '18', name: '重置1' }])
      await storage.batchCreate<TestEntity>('reset2', [{ id: '19', name: '重置2' }])

      expect(storage.hasData()).toBe(true)

      await storage.clearAllData()
      expect(storage.hasData()).toBe(false)
    })
  })

  describe('边界情况处理', () => {
    it('处理空数组时应该正常工作', async () => {
      const result = await storage.batchCreate<TestEntity>('empty', [])
      expect(result).toHaveLength(0)

      const all = await storage.getAll<TestEntity>('empty')
      expect(all).toHaveLength(0)
    })

    it('处理特殊字符的数据应该正常工作', async () => {
      const specialData: TestEntity = {
        id: '20',
        name: '包含"特殊"<字符>&符号',
        description: '测试换行\n和制表符\t'
      }

      await storage.create<TestEntity>('special', specialData)
      const result = await storage.getById<TestEntity>('special', '20')

      expect(result?.name).toContain('"特殊"')
      expect(result?.description).toContain('\n')
    })

    it('大量数据的性能测试', async () => {
      const largeDataset: TestEntity[] = Array.from({ length: 1000 }, (_, index) => ({
        id: `item-${index}`,
        name: `数据项${index}`,
        index
      }))

      const startTime = Date.now()
      await storage.batchCreate<TestEntity>('large', largeDataset)
      const createTime = Date.now() - startTime

      console.log(`创建1000条数据耗时: ${createTime}ms`)

      const allData = await storage.getAll<TestEntity>('large')
      expect(allData).toHaveLength(1000)

      const readStartTime = Date.now()
      const readData = await storage.getById<TestEntity>('large', 'item-500')
      const readTime = Date.now() - readStartTime

      console.log(`读取单条数据耗时: ${readTime}ms`)
      expect(readData?.index).toBe(500)
    })
  })
})
