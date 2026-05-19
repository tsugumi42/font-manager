<script setup lang="ts">
import { computed } from 'vue'
import {
  NInput,
  NButton,
  NTag,
  NAlert,
  NCard,
  NText,
  NDivider,
  NSpace,
} from 'naive-ui'
import { useFontStore } from '@/stores/fontStore'

const fontStore = useFontStore()

const font = computed(() => fontStore.selectedFont)
const result = computed(() => fontStore.charCheckResult)

function runCheck() {
  fontStore.runCharCheck(fontStore.charCheckInput)
}

function pasteFromClipboard() {
  fontStore.pasteFromClipboard()
}
</script>

<template>
  <div class="char-check" v-if="font">
    <NCard size="small" :bordered="true" class="input-card">
      <NText depth="3" class="section-title">输入文本进行字符检测</NText>
      <NInput
        v-model:value="fontStore.charCheckInput"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 6 }"
        placeholder="输入要检测的文本，例如：𠮷野家で𩸽定食"
        class="char-input"
      />
      <NSpace :size="8">
        <NButton
          type="primary"
          size="small"
          @click="runCheck"
          :disabled="!fontStore.charCheckInput.trim()"
        >
          检测
        </NButton>
        <NButton
          size="small"
          quaternary
          @click="pasteFromClipboard"
        >
          粘贴剪贴板并检测
        </NButton>
      </NSpace>
    </NCard>

    <div v-if="result" class="result-area">
      <NAlert
        :type="result.allSupported ? 'success' : 'warning'"
        :title="result.allSupported ? '全部字符支持' : '部分字符缺失'"
      >
        <template v-if="!result.allSupported">
          输入文本中包含 {{ result.missingChars.length }} 个当前字体不支持的字符。
        </template>
      </NAlert>

      <div v-if="result.missingChars.length > 0" class="missing-chars">
        <NDivider style="margin: 12px 0" />
        <NText depth="3" class="section-label">缺失字符列表：</NText>
        <div class="missing-list">
          <NTag
            v-for="ch in result.missingChars"
            :key="ch"
            size="medium"
            type="error"
            :bordered="true"
            class="char-tag"
          >
            {{ ch }}
            <span class="char-unicode">U+{{ ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0') }}</span>
          </NTag>
        </div>
      </div>

      <NDivider v-if="font.missingCharsMock.length > 0" style="margin: 12px 0" />
      <div v-if="font.missingCharsMock.length > 0">
        <NText depth="3" class="section-label">该字体的已知缺字列表（Mock）：</NText>
        <div class="missing-list">
          <NTag
            v-for="ch in font.missingCharsMock"
            :key="ch"
            size="small"
            type="default"
            :bordered="true"
          >
            {{ ch }}
          </NTag>
        </div>
      </div>
    </div>

    <div v-else class="no-result">
      <NText depth="3">输入文本并点击"检测"按钮查看结果。</NText>
    </div>
  </div>
  <div v-else class="no-font">请选择一个字体</div>
</template>

<style scoped>
.char-check {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
}

.char-input {
  margin-bottom: 8px;
}

.result-area {
  margin-top: 4px;
}

.section-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
}

.missing-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.char-tag {
  font-size: 18px;
  min-width: 40px;
  justify-content: center;
}

.char-unicode {
  margin-left: 8px;
  font-size: 10px;
  opacity: 0.7;
}

.no-result {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.no-font {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--n-text-color-3);
}
</style>
