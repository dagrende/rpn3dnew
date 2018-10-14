<template>
  <div class="command-log" :hidden="$store.state.commandLog.isEmpty()" @copy="copy" @paste="paste">
    <div v-for="(command, i) in $store.state.commandLog.list()"
      class="command-log-item"
      :class="{selected: isSelected(i), error: $store.state.commandLog.errorIndex() !== null && i >= $store.state.commandLog.errorIndex()}"
      @click="click($event, i)">{{commands[command.id].title}}</div>
    <!-- <input ref="hidden-input" class="hidden" type="text" value=""/> -->
  </div>
</template>
<script>
  import commands from './commands';
  import { mapGetters } from 'vuex'

  export default {
    data() {
      return {
        commands,
        // firstSelected: null,
        // lastSelected: null
      };
    },
    computed: {
      firstSelected () {
        return this.$store.getters.getFirstSelected
      },
      lastSelected () {
        return this.$store.getters.getLastSelected
      }
    },
    methods: {
      copy(event) {
        console.log(event);
        event.preventDefault();
        if (this.firstSelected !== null) {
          let saveText = JSON.stringify(this.$store.state.commandLog.saveFormat().slice(this.firstSelected, this.lastSelected + 1), null, '  ');
          console.log('copying', saveText);
          event.clipboardData.setData('text/plain', saveText);
        }
      },
      paste(event) {
        console.log(event);
        event.preventDefault();
        let clipboardText = event.clipboardData.getData('text/plain');
        console.log('clipboardText', clipboardText);
        try {
          let pastedCommandList = JSON.parse(clipboardText);
          console.log(pastedCommandList);
          this.$store.commit('pasteCommandList', pastedCommandList)
        } catch(err) {
          console.error(err);
        }
      },
      isSelected(i) {
        let currentIndex = this.$store.state.commandLog.currentIndex();
        if (currentIndex < this.firstSelected || this.lastSelected < currentIndex) {
          this.$store.state.firstSelected = currentIndex;
          this.$store.state.lastSelected = currentIndex;
        }
        return this.firstSelected !== null && this.firstSelected <= i && i <= this.lastSelected
      },
      click(event, i) {
        this.select(event, i);
        this.$store.commit('setCommandLogIndex', i)
      },
      select(event, i) {
        if (event.shiftKey && this.firstSelected !== null) {
          if (i < this.firstSelected) {
            this.$store.state.firstSelected = i;
          } if (i > this.lastSelected) {
            this.$store.state.lastSelected = i;
          }
        } else {
          this.$store.state.firstSelected = i;
          this.$store.state.lastSelected = i;
        }
      }
    }
  }
</script>
<style>
/* .command-log {
  user-select: none;
} */
.command-log-item.selected {
  background-color: white;
}
.command-log-item.error {
  background-color: red;
}
.hidden {
	position:	absolute;
	bottom:		0;
	left:		0;
	width:		10px;
	height:		10px;
	display:	block;
	font-size:	1;
	z-index:	-1;
	color:		transparent;
	background:	transparent;
	overflow:	hidden;
	border:		none;
	padding:	0;
	resize:		none;
	outline:	none;
	-webkit-user-select: text;
	user-select: text; /* Because for user-select:none, Safari won't allow input */
}
</style>
