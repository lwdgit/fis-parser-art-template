<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{=title}}</title>
  {{if stylesheets}}
  {{each stylesheets}}
    <link type="stylesheet" href="{{$value}}" />
  {{/each}}
  {{/if}}
</head>
<body>
    
