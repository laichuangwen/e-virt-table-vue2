<template>
  <div id="app">
    <el-switch
      v-model="enable"
      active-text="enable"
      inactive-text="disable"
      @change="handleEnable"
    >
    </el-switch>
    <EVirtTableVue
      @ready="onReady"
      @selectionChange="selectionChange"
      :columns="columns"
      :data="tableData"
      :config="config"
    >
      <template #avatar="{ row }">
        <div
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
          "
        >
          <el-image
            style="width: 25px; height: 25px; border-radius: 50%"
            :src="row.avatar"
            fit="cover"
            :preview-src-list="[row.avatar]"
          ></el-image>
        </div>
      </template>
    </EVirtTableVue>
  </div>
</template>

<script>
import { faker } from "@faker-js/faker";
import EVirtTableVue from "./components/EVirtTableVue";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear"; // ES 2015
dayjs.extend(weekOfYear);

export default {
  components: {
    EVirtTableVue,
  },
  data() {
    return {
      loading: false,
      enable: true,
      grid: null,
      tableData: [],
      columns: [
        // {
        //     title: '序号',
        //     key: 'index',
        //     type: 'index',
        //     width: 50,
        // },
        {
          key: "selection",
          type: "selection",
          width: 50,
          fixed: "left",
        },
        {
          title: "name",
          key: "emp_name",
          readonly: true,
          align: "left",
          fixed: "left",
          width: 150,
          // render形式
          render: (_, { row }) => {
            return (
              <el-button
                type="text"
                style="color: #409EFF; text-decoration: underline"
              >
                {row.emp_name}
              </el-button>
            );
          },
        },
        {
          title: "avatar",
          key: "avatar",
          render: "avatar",
          overflowTooltipShow: false,
          readonly: true,
        },
        {
          title: "customType",
          key: "customType",
          readonly: true,
          width: 150,
        },
        {
          title: "custom",
          key: "custom",
          readonly: false,
          width: 150,
        },
        {
          title: "sex",
          key: "sex",
          editorType: "select",
          editorProps: {
            options: [
              {
                label: "男",
                value: 1,
              },
              {
                label: "女",
                value: 2,
              },
            ],
          },
          formatter({ value }) {
            const data = {
              1: "male",
              2: "female",
            };
            return data[value] || "";
          },
        },
        {
          title: "number",
          key: "requiredQuantity",
          align: "right",
          editorType: "number",
          editorProps: {
            precision: 0,
          },
        },
        {
          title: "amount",
          key: "amount",
          align: "right",
          editorType: "number",
          editorProps: {
            min: 0,
            max: 9999999,
            precision: 2,
          },
        },
        {
          title: "month",
          key: "month",
          editorType: "date",
          editorProps: {
            placeholder: "选择月",
            format: "yyyy-MM",
            valueFormat: "yyyy-MM",
            type: "month",
          },
        },
        {
          title: "date",
          key: "date",
          editorType: "date",
          editorProps: {
            type: "date",
            format: "yyyy-MM-dd",
            valueFormat: "yyyy-MM-dd",
          },
        },
        {
          title: "week",
          key: "week",
          editorType: "date",
          width: 150,
          editorProps: {
            type: "week",
            format: "yyyy年 第 WW 周",
          },
          formatter({ value }) {
            return `${dayjs(value).format("YYYY")}年第${dayjs(value).week()}周`;
          },
        },
        {
          title: "time",
          key: "time",
          editorType: "time",
          editorProps: {
            format: "HH:mm:ss",
            valueFormat: "HH:mm:ss",
          },
        },
        {
          title: "address",
          key: "address",
          align: "left",
          width: 250,
          overflowTooltipShow: true,
          overflowTooltipWidth: 200,
          overflowTooltipPlacement: "top",
          rules: {
            required: true,
            message: "该项必填哦！",
          },
        },
        {
          title: "email",
          key: "email",
          width: 200,
        },
      ],
      config: {
        // ROW_KEY: 'id',
        CELL_HEIGHT: 36,
        HEIGHT: 500,
        ENABLE_SELECTOR: true,
        ENABLE_AUTOFILL: true,
        HIGHLIGHT_HOVER_ROW: true,
        HIGHLIGHT_SELECTED_ROW: false,
        ENABLE_RESIZE_ROW: false,
        FOOTER_FIXED: true,
        SELECTOR_AREA_MIN_X: 4, // 设置选择器最小范围
        CONTEXT_MENU: [
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
        ],
        ENABLE_CONTEXT_MENU: true,
        // ENABLE_SELECTOR_SPAN_COL: false, // 设置只能选中一个
        // ENABLE_SELECTOR_SPAN_ROW: false, // 设置只能选中一个
        // ENABLE_SELECTOR_ALL_ROWS: false, // 设置只能选中一个
        // ENABLE_SELECTOR_ALL_COLS: false, // 设置只能选中一个
        BODY_CELL_EDITOR_METHOD: ({ column, row }) => {
          if (column.key === "custom") {
            if (row.customType === "select") {
              return {
                type: "select",
                props: {
                  filterable: true,
                  options: [
                    { label: "male", value: "male" },
                    { label: "female", value: "female" },
                  ],
                },
              };
            }
            if (row.customType === "date") {
              return {
                type: "date",
                props: {
                  type: "date",
                  valueFormat: "yyyy-MM-DD",
                },
              };
            }
          }
        },
      },
    };
  },
  mounted() {
    const editorTypes = ["text", "select", "date"];
    const users = faker.helpers.multiple(
      () => {
        return {
          uuid: faker.string.uuid(),
          emp_name: faker.person.fullName(),
          avatar: faker.image.avatar(),
          address: faker.location.streetAddress(),
          customType:
            editorTypes[
              faker.number.int({ min: 0, max: editorTypes.length - 1 })
            ],
          requiredQuantity: faker.number.int({ min: 24, max: 66 }),
          amount: faker.number.float({ min: 0, max: 9999, fractionDigits: 2 }),
          sex: faker.number.int({ min: 1, max: 2 }),
          level: ["S", "A", "B", "C", "D"][
            faker.number.int({ min: 0, max: 4 })
          ],
          date: dayjs(faker.date.recent()).format("YYYY-MM-DD"),
          years: dayjs(faker.date.anytime()).format("YYYY"),
          month: dayjs(faker.date.anytime()).format("YYYY-MM"),
          week: faker.date.anytime(),
          time: dayjs(faker.date.anytime()).format("HH:mm:ss"),
          email: faker.internet.email(),
        };
      },
      {
        count: 5000,
      }
    );
    this.tableData = users;
  },
  methods: {
    selectionChange(list) {
      console.log(list);
    },
    handleEnable(value) {
      this.grid?.loadConfig({
        ...this.config,
        DISABLED: !value,
      });
    },
    onReady(grid) {
      this.grid = grid;
    },
  },
};
</script>

<style lang="scss"></style>
