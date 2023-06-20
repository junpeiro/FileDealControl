<template>
  <div id="InitDeal">
    <el-row  :gutter="20" >
      <el-col  v-if="!isDiskCheck">
        <el-button type="primary" @click="scanDisk">获取硬盘信息</el-button>
      </el-col>
      <el-col v-if="isDiskCheck">
        <el-select style="width: 300px; margin-right: 16px; vertical-align: middle" v-model="diskPath" placeholder="请选择硬盘" @change="getDiskInfo" >
          <el-option v-for="item in options" :key="item.label" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-input :span="8" style="width: 300px; margin-right: 16px; vertical-align: middle" v-model="keyWord" placeholder="文件关键字" ></el-input>
        <el-button type="primary" @click="findAllByDiskNm">查询</el-button>
      </el-col>
    </el-row>

    <el-row :gutter="3" style="margin: 10px 0;" v-if="isDiskCheck">
      <el-button type="warning" @click="scanFileByDisk">扫描文件</el-button>

    </el-row>

    <div v-if="isDiskCheck">
      <el-table border fit :data="tableData" highlight-current-row style="width: 100%;font-size: 12px;">
        <el-table-column type="index" width="50"></el-table-column>
        <el-table-column prop="fileName" label="文件名"></el-table-column>
        <el-table-column prop="fileSize" label="文件大小"></el-table-column>
        <el-table-column prop="filePath" label="文件路径"></el-table-column>
        <el-table-column prop="fileDate" label="文件日期"></el-table-column>
        <el-table-column prop="fileType" label="文件类型"></el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button
                size="small"
                v-loading="openFileLoading"
                @click="handleOpen(scope.$index, scope.row)">打开</el-button>
            <el-button
                size="small"
                type="danger"
                v-loading="delFileLoading"
                @click="handleDelete(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="createTime.time" label="创建时间" sortable :formatter="formatCreateDate">
        </el-table-column>
      </el-table>
      <el-col class="toolbar" style="padding:10px;">
        <el-pagination @current-change="findAllByDiskNm" :current-page="currentPage" :page-size="30"
                       layout="total, prev, pager, next, jumper" :total="total" style="float:right"></el-pagination>
      </el-col>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request.js'

export default {
  name: "InitDeal",
  data () {
    return {
      tableData: [],
      options: [],
      currentPage: 1,
      total: 10,
      listLoading: false,
      openFileLoading: false,
      delFileLoading: false,
      diskPath: null,
      diskName: null,
      keyWord: null,
      isDiskCheck: false
    }
  },
  mounted: function() {
    //this.scanDisk();
  },
  methods: {
    handleOpen(index, row) {
      let that = this;
      that.openFileLoading = true;
      request.get("/fileDeal/openFile", {
        params: {
          fileName: row.fileName,
          filePath: row.filePath,
          filePw: row.filePw
        }
      }).then(function(response) {
        if(response.data.code===200) {
          that.openFileLoading = false;
          that.findAllByDiskNm();
        } else {
          that.$message({
            type: 'warning',
            message: response.data.msg
          });
        }
      }).catch(function(response) {
        console.error(response);
      });
    },
    handleDelete(index, row) {
      let that = this;
      that.delFileLoading = true;
      request.get("/fileDeal/deleteFile", {
        params: {
          fileName: row.fileName,
          filePath: row.filePath
        }
      }).then(function(response) {
        if(response.data.code===200) {
          that.delFileLoading = false;
          that.findAllByDiskNm();
        } else {
          that.$message({
            type: 'warning',
            message: response.data.msg
          });
        }
      }).catch(function(response) {
        console.error(response);
      });
    },
    scanDisk() {
      let that = this;
      request.get("/fileDeal/scanDisk", {
        params: ''
      }).then(function(response) {
        that.options = response.data;
        that.isDiskCheck = true;
      }).catch(function(response) {
        console.error(response);
      });
    },
    getDiskInfo(val) {
      let opt= {};
      opt = this.options.find((item)=>{
        return item.value === val;
      })
      this.diskName = opt.label;
    },
    findAllByDiskNm: function(currentPage) {
      this.listLoading = true;
      if (!isNaN(currentPage)) {
        this.currentPage = currentPage;
      }
      let params_ = {
        pageNum: this.currentPage,
        pageSize: 10
      };
      if (this.diskName && this.diskName.trim() !== "") {
        params_['diskName'] = this.diskName;
      }
      if (this.keyWord && this.keyWord.trim() !== "") {
        params_['keyWord'] = this.keyWord;
      }
      let that = this;
      request.get("/fileDeal/findAllByDiskNm", {
        params: params_
      }).then(function(response) {
        that.total = response.data.count;
        that.tableData = response.data.list;
      }).catch(function(response) {
        console.error(response);
      });
      that.listLoading = false;
    },
    scanFileByDisk() {
      this.$confirm('此操作将重新扫描该盘下所有文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const loading = this.$loading({
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        let params_ = {
          diskName: this.diskName,
          disPath: this.disPath
        };
        let that = this;
        request.get("/fileDeal/scanFileByDisk", {
          params_
        }).then(function(response) {
          loading.close();
          if(response.data.code===200) {
            that.$alert('扫描完成', '提示', {
              confirmButtonText: '确定',
              callback: () => {
                that.findAllByDiskNm();
              }
            });
          }
        }).catch(function(response) {
          console.error(response);
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },
    formatDate: function getNowFormatDate(time) {
      let date = new Date(time);
      let seperator1 = "-";
      let seperator2 = ":";
      let month = date.getMonth() + 1;
      let strDate = date.getDate();
      if (month >= 1 && month <= 9) {
        month = "0" + month;
      }
      if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
      }
      let currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
          " " + date.getHours() + seperator2 + date.getMinutes() +
          seperator2 + date.getSeconds();
      return currentdate;
    },
    formatCreateDate: function(row) {
      if (row.createTime != null) {
        return this.formatDate(row.createTime);
      } else {
        return '';
      }
    },
    formatSex: function(row) {
      if (row.sex != null) {
        return row.sex === 1 ? '男' : '女';
      }
    }
  }
}
</script>

<style scoped>
</style>