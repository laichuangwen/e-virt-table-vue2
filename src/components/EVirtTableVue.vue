<template>
  <div
    class="d-evirt-table"
    v-loading="loading"
    :element-loading-text="loadingText"
    element-loading-spinner="el-icon-loading"
  >
    <div ref="canvasRef" class="d-evirt-table-table"></div>
    <div
      ref="editorRef"
      class="d-evirt-table-editor"
      v-loading="editorLoading"
      element-loading-spinner="el-icon-loading"
    >
      <el-date-picker
        v-if="editorType === 'date'"
        class="d-evirt-table-editor-date"
        :style="popupStyle"
        ref="dateRef"
        v-model="dateValue"
        @change="saveCellValue"
        v-bind="editorCell.editorProps"
      />
      <el-time-picker
        v-if="editorType === 'time'"
        class="d-evirt-table-editor-time"
        :style="popupStyle"
        ref="timeRef"
        v-model="timeValue"
        @change="saveCellValue"
        v-bind="editorCell.editorProps"
      />
      <el-select
        v-if="editorType === 'select'"
        ref="selectRef"
        class="d-evirt-table-editor-select"
        :style="popupStyle"
        v-model="selectValue"
        @change="saveCellValue"
        filterable
        v-bind="editorCell.editorProps"
      >
        <el-option
          v-for="item in editorCell.editorProps?.options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
      <el-cascader
        v-if="editorType === 'cascader'"
        ref="cascaderRef"
        class="d-evirt-table-editor-cascader"
        :style="popupStyle"
        v-model="cascaderValue"
        @change="saveCellValue"
        filterable
        v-bind="editorCell.editorProps"
      ></el-cascader>
      <el-input-number
        v-if="editorType === 'number'"
        class="d-evirt-table-editor-number"
        ref="numberRef"
        :style="popupStyle"
        v-model="numberValue"
        :controls="false"
        @change="saveCellValue"
        v-bind="editorCell.editorProps"
      >
      </el-input-number>
      <slot name="editor" v-bind="editorSlotProps"></slot>
    </div>
    <div ref="overlayerRef">
      <div
        :class="wrapper.class"
        v-for="wrapper in overlayerView.views"
        :style="wrapper.style"
        :key="wrapper.type"
      >
        <div :style="view.style" v-for="view in wrapper.views" :key="view.key">
          <div
            class="cell"
            v-for="cell in view.cells"
            :key="`${cell.rowKey}_${cell.key}`"
            :style="cell.style"
          >
            <CellSlot v-if="isFunction(cell.render)" :cell="cell"></CellSlot>
            <slot
              v-if="isString(cell.render)"
              :name="cell.render"
              v-bind="cell"
              :cell="cell"
            >
            </slot>
          </div>
        </div>
      </div>
    </div>
    <div ref="contextMenuRef">
      <ContextMenu :menu="menus" @select="handleContextMenu">
        <template #menuItem="item">
          <slot name="contextMenuItem" :item="item">
            {{ item.label }}
          </slot>
        </template>
      </ContextMenu>
    </div>
    <div ref="emptyRef">
      <slot name="empty">
        <span class="empty-text">{{ emptyText }}</span>
      </slot>
    </div>
  </div>
</template>

<script>
import EVirtTable from "e-virt-table";
import CellSlot from "./CellSlot.js";
import ContextMenu from "./ContextMenu.vue";

export default {
  components: {
    CellSlot,
    ContextMenu,
  },
  props: {
    columns: {
      type: Array,
      default() {
        return [];
      },
    },
    config: {
      type: Object,
      default() {
        return {};
      },
    },
    loadingText: {
      type: String,
      default: "加载中",
    },
    loading: {
      type: Boolean,
      default: false,
    },
    editorLoading: {
      type: Boolean,
      default: false,
    },
    footerData: {
      type: Array,
      default() {
        return [];
      },
    },
    data: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      selectValue: null,
      dateValue: null,
      numberValue: null,
      cascaderValue: null,
      timeValue: null,
      overlayerView: {
        views: [],
      },
      empty: "",
      emptyTop: 0,
      editorType: "text",
      popWidth: 0,
      popHeight: 0,
      editorCell: null, // 编辑单元格
    };
  },
  computed: {
    DEFAULT_CONTEXT_MENU() {
      return [
        {
          label: "复制",
          value: "copy",
        },
        {
          label: "剪切",
          value: "cut",
        },
        {
          label: "粘贴",
          value: "paste",
        },
        {
          label: "清空选中内容",
          value: "clearSelected",
        },
      ];
    },
    emptyText() {
      return this.config.EMPTY_TEXT || "暂无数据";
    },
    slots() {
      return Object.keys(this.$slots);
    },
    CSS_PREFIX() {
      return this.grid?.config?.CSS_PREFIX;
    },
    EMPTY_BOTTOM() {
      const { EMPTY_BODY_HEIGHT = 0, SCROLLER_TRACK_SIZE = 0 } =
        this.grid?.config || {};
      return (EMPTY_BODY_HEIGHT + SCROLLER_TRACK_SIZE) / 2;
    },
    popupStyle() {
      return {
        width: `${this.popWidth}px`,
        height: `${this.popHeight}px`,
      };
    },
    editorSlotProps() {
      return {
        editorType: this.editorType,
        popupStyle: this.popupStyle,
        cell: this.editorCell,
      };
    },
    menus() {
      if (!this.config.CONTEXT_MENU) return this.DEFAULT_CONTEXT_MENU;
      return this.config.CONTEXT_MENU || [];
    },
  },
  watch: {
    config: {
      handler(val) {
        this.grid?.loadConfig(val);
      },
      deep: true,
    },
    columns: {
      handler(val) {
        this.grid?.loadColumns(val);
      },
      deep: true,
    },
    footerData: {
      handler(val) {
        this.grid?.loadFooterData(val);
      },
      deep: true,
    },
    data(val) {
      this.grid?.loadData(val);
    },
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.grid?.destroy();
  },
  methods: {
    handleContextMenu(menuItem) {
      const { value } = menuItem;
      const defaultActions = {
        copy: "contextMenuCopy",
        cut: "contextMenuCut",
        paste: "contextMenuPaste",
        clearSelected: "contextMenuClearSelected",
      };
      if (defaultActions?.[value]) {
        this.grid.emit(defaultActions[value]);
      } else {
        this.$emit("contextMenuClick", menuItem);
      }
      this.grid.contextMenuHide();
    },
    isFunction(val) {
      return typeof val === "function";
    },
    isString(val) {
      return typeof val === "string" && val !== "default";
    },
    destroy() {
      this.grid?.destroy();
    },
    init() {
      this.$nextTick(() => {
        const target = this.$refs.canvasRef;
        const grid = new EVirtTable(target, {
          overlayerElement: this.$refs.overlayerRef,
          data: this.data,
          columns: this.columns,
          footerData: this.footerData,
          config: this.config,
          editorElement: this.$refs.editorRef,
          contextMenuElement: this.$refs.contextMenuRef,
          emptyElement: this.$refs.emptyRef,
        });
        this.grid = grid;
        // 动态绑定事件
        Object.keys(this.$listeners).forEach((key) => {
          const func = this.$listeners[key];
          if (typeof func === "function") {
            const eventName = key; // 获取事件名称
            this.grid?.on(eventName, func);
          }
        });
        this.grid.on("startEdit", (cell) => {
          this.editorCell = cell;
          this.editorType = cell.editorType;
          this.popWidth = cell.width;
          this.popHeight = cell.height;
          // 内部已经处理了文本类型的编辑
          this.$nextTick(() => {
            if (this.editorType === "select") {
              this.selectValue = cell.getValue();
              this.$refs.selectRef?.focus();
            } else if (this.editorType === "date") {
              this.dateValue = cell.getValue();
              this.$refs.dateRef?.focus();
            } else if (this.editorType === "number") {
              this.numberValue = cell.getValue();
              this.$refs.numberRef?.focus();
            } else if (this.editorType === "cascader") {
              this.cascaderValue = cell.getValue();
              this.$refs.cascaderRef?.focus();
            } else if (this.editorType === "time") {
              this.timeValue = cell.getValue();
              this.$refs.timeRef?.focus();
            }
          });
        });
        this.grid.on("doneEdit", () => {
          this.editorType = "text";
        });
        this.grid.on("overlayerChange", (overlayer) => {
          this.overlayerView = overlayer;
        });
        // 动态绑定方法
        this.$emit("ready", this.grid);
      });
    },
    saveCellValue(value) {
      const { rowKey, key } = this.editorCell;
      this.grid?.setItemValueByEditor(rowKey, key, value);
    },
  },
};
</script>

<style lang="scss">
.d-evirt-table {
  --el-menu-item-height: 40px;
  --el-menu-active-color: "#303133";
  overflow: hidden;
  position: relative;
  width: auto;
}
.e-virt-table-stage {
  box-sizing: border-box;
}

.d-evirt-table-editor {
  position: absolute;
  text-align: left;
  z-index: 100;
  background-color: #fff;
  border-style: solid;
  box-sizing: border-box;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 6px 16px;
  pointer-events: auto;
  display: flex;
  align-items: center;
}
.d-evirt-table-editor-select,
.d-evirt-table-editor-time,
.d-evirt-table-editor-date,
.d-evirt-table-editor-cascader,
.d-evirt-table-editor-number {
  height: 100%;
  display: flex;
  align-items: center;
  .el-input__inner {
    border: none;
  }
}

.d-evirt-table-editor-number .el-input__inner {
  text-align: right;
}

.d-evirt-table-overlayer {
  position: absolute;
  top: 0px;
  left: 0px;
}

.d-evirt-table-empty {
  font-size: 14px;
  color: #666;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.e-virt-table-context-menu {
  padding: 0 !important;
}
.empty-text {
  font-size: 14px;
  color: var(--jn-color-text-secondary);
}
</style>
