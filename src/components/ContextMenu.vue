<script>
export default {
    props: {
        menu: {
            type: Array,
            default: () => [],
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        handleSelect(item) {
            if (item.event && typeof item.event === 'function') {
                item.event(item);
            } else {
                this.$emit('select', item);
            }
        },
        // 递归渲染子菜单，传入子菜单数据
        renderSubMenu(item) {
            return item.children && item.children.length ? (
                <el-submenu
                    popper-class="d-context-submenu"
                    disabled={item.disabled}
                    index={item.value}
                    key={item.value}
                >
                    <template slot="title">
                        {this.$scopedSlots.menuItem ? (
                            this.$scopedSlots.menuItem(item)
                        ) : (
                            <div class="menu-title">
                                {item.icon && <i class={item.icon}></i>}
                                {item.label}
                            </div>
                        )}
                    </template>
                    {item.children.map((child) => this.renderSubMenu(child))}
                </el-submenu>
            ) : (
                <el-menu-item index={item.value} disabled={item.disabled} onClick={() => this.handleSelect(item)}>
                    {this.$scopedSlots.menuItem ? (
                        this.$scopedSlots.menuItem(item)
                    ) : (
                        <div class="menu-title">
                            {item.icon && <i class={item.icon}></i>}
                            {item.label}
                        </div>
                    )}
                </el-menu-item>
            );
        },
    },
    render() {
        return (
            <el-menu ref="menu" class="d-context-el-menu" collapse={true}>
                {this.menu.map((item) => this.renderSubMenu(item))}
            </el-menu>
        );
    },
};
</script>

<style lang="scss" scoped>
.d-context-el-menu {
    border: none;
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    overflow: hidden;
    transition: none;
    &.el-menu--collapse {
        width: fit-content !important;
    }
    ::v-deep {
        i {
            all: unset;
            display: inline-block !important;
            font-size: 12px;
            margin: 0;
            vertical-align: middle;
            text-align: center;
            width: fit-content !important;
        }
        .el-submenu__title,
        .el-menu-item {
            height: fit-content !important;
            padding: 8px 12px !important;
            line-height: 1;
            display: flex;
            align-items: center;
            min-width: fit-content !important;
            .menu-title {
                display: flex;
                align-items: center;
                gap: 4px;
            }
        }
    }
}
</style>
<style lang="scss">
.d-context-submenu {
    height: fit-content !important;
    .el-menu--popup {
        padding: 0;
        min-width: fit-content !important;
    }
    .el-submenu__title {
        height: fit-content !important;
        padding: 8px 12px !important;
        line-height: 1;
        display: flex;
        align-items: center;
        min-width: fit-content !important;
    }
    i {
        all: unset;
        display: inline-block !important;
        font-size: 12px !important;
        margin: 0;
        vertical-align: middle;
        text-align: center;
        width: fit-content !important;
    }
    .el-submenu {
        &.is-opened {
            .el-submenu__title {
                .el-submenu__icon-arrow {
                    transform: rotate(0deg) !important;
                }
            }
        }
    }
    .el-menu {
        .el-menu-item {
            padding: 8px 12px !important;
            line-height: 1;
            height: fit-content !important;
            min-width: fit-content !important;
            display: flex;
            align-items: center;
        }
        .el-menu-item [class^='el-icon-'] {
            margin-right: 0 !important;
        }
    }
    .menu-title {
        display: flex;
        align-items: center;
        gap: 4px;
    }
}
</style>
