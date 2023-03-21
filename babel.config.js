
//[
//       "import",
//       {
//         "libraryName": "element-ui",
//         "styleLibraryName": "theme-chalk"
//       }
//     ],


module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [

    [
      "prismjs",
      {
        "languages": [
          "html",
          "css",
          "less",
          "javascript",
          "typescript",
          "json",
          "xml",
          "bash",
          "nginx",
          "sql",
          "docker",
          "php",
          "java",
          "go",
          "python",
          "ruby",
          "rust",
          "objectivec",
          "c",
          "csharp",
          "cpp",
          "lua",
          "shell",
          "vim",
          "yaml",
          "yml",
          "md",
          "erlang",
          "ini"
        ],
        "theme": "okaidia"
      }
    ]
  ]
}
