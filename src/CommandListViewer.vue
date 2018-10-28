<template>
  <div class="command-log" :hidden="$store.state.commandLog.isEmpty()" @copy="copy" @paste="paste">
    <div v-for="(command, i) in $store.state.commandLog.list()"
      class="command-log-item"
      :ref="'cmd' + i"
      :class="{selected: isSelected(i), error: $store.state.commandLog.errorIndex() !== null && i >= $store.state.commandLog.errorIndex()}"
      @click="click($event, i)">{{commands[command.id].title}}</div>
    <!-- <input ref="hidden-input" class="hidden" type="text" value=""/> -->
  </div>
</template>
<script>
  import commands from './commands';
  import store from './store';

  export default {
    data() {
      return {
        commands,
      };
    },
    created() {
      console.log('created');
      window.addEventListener( 'keydown', keyEventListener, false);
      window.addEventListener( 'scroll', scrollEventListener, false);

    },
    destroyed() {
      window.removeEventListener( 'keydown', keyEventListener, false);
      window.removeEventListener( 'scroll', scrollEventListener, false);
    },
    computed: {
      firstSelected () {
        return this.$store.getters.getFirstSelected
      },
      lastSelected () {
        return this.$store.getters.getLastSelected
      }
    },
    watch: {
      lastSelected(newValue) {
        // scrollIntoView
        let refId = 'cmd' + newValue;
        let cmdElement = this.$refs[refId];
        if (cmdElement) {
          let el = cmdElement[0];
          if (!isFullyVisible(el)) {
            el.parentNode.scrollTop = el.offsetTop - el.parentNode.offsetTop - el.parentNode.clientHeight / 2;
          }
        }
      }
    },
    methods: {
      keyUp() {
        console.log('keyUp');
      },
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

  function scrollEventListener(e) {
    console.log('scroll', e);
  }

  function keyEventListener(e) {
    const moveSelection = d => {
      store.state.commandLog = store.state.commandLog.setCurrentIndex(store.state.commandLog.currentIndex() + d)
    };
console.log(e);
    if (e.key === 'ArrowUp') {
      moveSelection(-1)
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      moveSelection(1);
      e.preventDefault();
    }
  }

  function isFullyVisible(el) {
      let parentRect = el.parentNode.getBoundingClientRect();
      let rect = el.getBoundingClientRect();
      return rect.top >= parentRect.top &&
        rect.left   >= parentRect.left &&
        rect.bottom <= parentRect.bottom &&
        rect.right  <= parentRect.right;
  }
</script>
<style>
/* .command-log {
  user-select: none;
} */
.command-log-item {
  padding: 0 .5em;
}
.command-log-item.selected {
  background-color: white;
}
.command-log-item.error {
  background-color: red;
}
/*
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
	user-select: text;
} */
</style>
