
<template>
    <div class="tree-box">
        <tree-node :list="list" :level="1"></tree-node>
    </div>
</template>

<script>
    import {getDefaultSelectRoom} from '../data/data-util';
    var $vm;
    var nodeSelected;

    export default {
        props: ['treeData', 'selectedNodeId'],

        data: function() {
            return {
                list: [this.$props.treeData]
            }
        },
        watch: {
            "treeData": function() {
                this.list = [this.$props.treeData]
            },
            "selectedNodeId": function() {
                if (nodeSelected.id === this.$props.selectedNodeId) {
                    return;
                }
                this.nodeSelectOuter(this.list, this.$props.selectedNodeId);
            }
        },

        methods: {
            // 从外部选择节点
            nodeSelectOuter: function(nodeList, nodeId) {
                for (var i = 0; i < nodeList.length; i++) {
                    if (nodeList[i].id === nodeId) {
                        nodeSelected.highlight = false;
                        nodeSelected = nodeList[i];
                        Vue.set(nodeSelected, "highlight", true);
                        return true;
                    } else {
                        if (this.nodeSelectOuter(nodeList[i].children, nodeId)) {
                            return true;
                        }
                    }
                }
                return false;
            }
        },

        created: function() {
            $vm = this;
            nodeSelected = this.$props.treeData;
            Vue.set(nodeSelected, "highlight", true);
            this.$emit("nodeselect", nodeSelected);
        },
        components: {
            "tree-node" : {
                "name": "tree-node",
                props: ['list', 'level'],
                "template": `
                <ul v-bind:class="'level-' + this.$props.level">
                    <li v-for="item in list">
                        <a v-bind:class="[{active: !!item.highlight}]" @click="onclickNode(item)">{{item.name}}</a>
                        <tree-node v-bind:list="item.children" v-bind:level="level+1" v-if="item.children && item.children.length > 0"></tree-node>
                    </li>
                </ul>
                `,
                methods: {
                    onclickNode: function(node) {
                        if (nodeSelected.id === node.id) {

                            return;
                        }
                        Vue.set(nodeSelected, "highlight", false);
                        Vue.set(node, "highlight", true);
                        nodeSelected = node;
                        $vm.$emit("nodeselect", node);
                    }
                }
            }
        }
    }
</script>
